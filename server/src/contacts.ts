import * as path from "path";
const Datastore = require("nedb");

export interface IContact {
    _id?: string,
    name: string,
    email: string
}

export class Worker {
    private db: Nedb;
    constructor() {
        this.db = new Datastore({
            filename: path.join(__dirname, "contacts.db"),
            autoload: true
        })
    }
    public listContacts(): Promise<IContact[]> {
        return new Promise((inResolve, inReject) => {
            this.db.find({ },
                (inError: Error, inDocs: IContact[]) => {
                    if(inError) {
                        inReject(inError);
                    } else {
                        inResolve(inDocs);
                    }
                }
            )
        })
    }
    public addContact(inContact: IContact): Promise<IContact> {
        return new Promise((inResolve, inReject) => 
            {this.db.insert(inContact, 
                (inError: Error | null, newDoc: IContact) => {
                    if(inError) {
                        inReject(inError);
                    } else {
                        inResolve(newDoc);
                    }
                }
            )
        });
    }
    public updateContact(inID: string, inName: string, inEmail: string): Promise<string> {
        return new Promise((inResolve, inReject) => {
                this.db.update({_id:inID}, {name:inName, email:inEmail}, {}, 
                    (inError: Error | null, numberOfUpdated: number, upsert: boolean) => {
                    if(inError) {
                        inReject(inError);
                    } else {
                        console.log(upsert)
                        inResolve("ok");
                    }
                }
            )
        });
    }
    public deleteContact(inID: string): Promise<string> {
        return new Promise((inResolve, inReject) => {
            this.db.remove({_id: inID }, {}, 
                (inError: Error | null, inNumRemoved: number) => {
                if(inError) {
                    inReject(inError)
                } else {
                    inResolve(`Removed the following records: ${inNumRemoved}`);
                }
            })
        })
    }
}