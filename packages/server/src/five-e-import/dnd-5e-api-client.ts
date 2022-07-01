
import fetch from "node-fetch";
import {injectable} from "inversify";

interface Dnd5eApiResult<DocType> {
    results: DocType[];
}

interface Dnd5eApiObject {
    name: string;
    index: string;
    url: string;
    desc: string;
}

export interface Dnd5eRule extends Dnd5eApiObject{
    subsections: Dnd5eSubSection[];
}

export interface Dnd5eSubSection extends Dnd5eApiObject{
    url: string;
}

@injectable()
export class Dnd5eApiClient {

    BASE_URL = "https://www.dnd5eapi.co";
    RULES_TO_GET = ["adventuring", "combat", "using-ability-scores"];

    getPage = async <PageType>(resource: string): Promise<PageType> => {
        const response = await fetch(this.BASE_URL + resource);
        if (!response.ok) {
            console.warn(response.ok);
            throw new Error(`Error while fetching open5e resource ${resource}`);
        }
        return await response.json();
    };

    getPages = async <PageType extends Dnd5eApiObject>(resource: string): Promise<PageType[]> => {
        try {
            const results = await this.getPage<Dnd5eApiResult<PageType>>(resource);
            const pages: PageType[] = [];
            for(let result of results.results){
                pages.push(await this.getPage<PageType>(result.url));
            }
            return pages;
        } catch (e) {
            console.warn(e.message);
        }
    };

    getRules = async (rulesToGet: string[] = this.RULES_TO_GET) => {
        const rules = [];
        for(let ruleToGet of rulesToGet){
            const rule = await this.getPage<Dnd5eRule>("/api/rules/" + ruleToGet);
            const subsections: Dnd5eSubSection[] = [];
            for(let section of rule.subsections){
                subsections.push(await this.getPage<Dnd5eSubSection>(section.url));
            }
            rule.subsections = subsections;
            rules.push(rule);
        }
        return rules;
    };
}