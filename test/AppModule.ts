import {Module} from "@nestjs/common";
import TestModule from "./TestModule";

class Options {
}

@Module({
    imports: [TestModule.forRoot<Options>('Test', {})]
})
export default class AppModule {

}