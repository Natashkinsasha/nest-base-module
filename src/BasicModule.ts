import {DynamicModule, Provider, Type} from "@nestjs/common";
import {ModuleMetadata} from "@nestjs/common/interfaces";


export default class BasicModule{



    public static forRoot<T>(provide: string, options: T): DynamicModule {
        return {
            module: BasicModule,
            providers: createProvider(provide, options)
        };
    }

    public static forRootAsync<T>(provide: string, options: ModuleAsyncOptions<T>): DynamicModule {
        return {
            module: BasicModule,
            imports: options.imports || [],
            providers: this.createAsyncProviders(provide, options)
        };
    }

    private static createAsyncProviders<T>(
        provide: string,
        options: ModuleAsyncOptions<T>
    ): Provider[] {
        if (options.useExisting || options.useFactory) {
            return [BasicModule.createAsyncOptionsProvider(provide, options)];
        }
        if(options.useClass){
            return [
                BasicModule.createAsyncOptionsProvider(provide, options),
                {
                    provide: options.useClass,
                    useClass: options.useClass
                }
            ];
        }
        return [
            this.createAsyncOptionsProvider(provide, options),
        ];
    }

    private static createAsyncOptionsProvider<T>(
        provide: string,
        options: ModuleAsyncOptions<T>
    ): Provider {
        if (options.useFactory) {
            return {
                provide,
                useFactory: options.useFactory,
                inject: options.inject || []
            };
        }
        if(options.useExisting){
            return {
                provide,
                useFactory: async (optionsFactory: OptionsFactory<T>) =>
                    await optionsFactory.createOptions(),
                inject: [options.useExisting]
            };
        }
        if(options.useClass){
            return {
                provide,
                useFactory: async (optionsFactory: OptionsFactory<T>) =>
                    await optionsFactory.createOptions(),
                inject: [options.useClass]
            };
        }
        return {
            provide,
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

function createProvider<T>(provide: string, options: T): Provider[] {
    return [{ provide, useValue: options || {} }];
}