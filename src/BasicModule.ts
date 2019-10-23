import {DynamicModule, Provider, Type} from "@nestjs/common";
import {ModuleMetadata} from "@nestjs/common/interfaces";


export default class BasicModule<T>{

    public forRoot(options: T): DynamicModule {
        return {
            module: BasicModule,
            providers: createProvider(options)
        };
    }

    public forRootAsync(options: ModuleAsyncOptions<T>): DynamicModule {
        return {
            module: BasicModule,
            imports: options.imports || [],
            providers: this.createAsyncProviders(options)
        };
    }

    private createAsyncProviders(
        options: ModuleAsyncOptions<T>
    ): Provider[] {
        if (options.useExisting || options.useFactory) {
            return [this.createAsyncOptionsProvider(options)];
        }
        if(options.useClass){
            return [
                this.createAsyncOptionsProvider(options),
                {
                    provide: options.useClass,
                    useClass: options.useClass
                }
            ];
        }
        return [
            this.createAsyncOptionsProvider(options),
        ];
    }

    private createAsyncOptionsProvider(
        options: ModuleAsyncOptions<T>
    ): Provider {
        if (options.useFactory) {
            return {
                provide: '',
                useFactory: options.useFactory,
                inject: options.inject || []
            };
        }
        if(options.useExisting){
            return {
                provide: '',
                useFactory: async (optionsFactory: OptionsFactory<T>) =>
                    await optionsFactory.createOptions(),
                inject: [options.useExisting]
            };
        }
        if(options.useClass){
            return {
                provide: '',
                useFactory: async (optionsFactory: OptionsFactory<T>) =>
                    await optionsFactory.createOptions(),
                inject: [options.useClass]
            };
        }
        return {
            provide: '',
            useFactory: async (optionsFactory: OptionsFactory<T>) =>
                await optionsFactory.createOptions(),
        };
    }

}


export interface OptionsFactory<T> {
    createOptions(): Promise<T> | T;
}

export interface ModuleAsyncOptions<T> extends Pick<ModuleMetadata, 'imports'> {
    useExisting?: Type<OptionsFactory<T>>;
    useClass?: Type<OptionsFactory<T>>;
    useFactory?: (...args: any[]) => Promise<T> | T;
    inject?: any[];
}

function createProvider<T>(options: T): Provider[] {
    return [{ provide: 'Module', useValue: options || {} }];
}