import path from "path";
import express, 
{ Express, NextFunction, Request, Response } from "express";
import { serverInfo } from "./ServerInfo";
import * as IMAP from "./IMAP";
import * as SMTP from "./SMTP";
import * as Contacts from "./contacts";
import { IContact } from "./contacts";

const app: Express = express();
app.use(express.json())
app.use("/", express.static(path.join(__dirname, "../../client/dist")))
app.use(function(inRequest: Request, inResponse: Response, inNext: NextFunction) {
    inResponse.header("Access-Control-Allow-Origin", "*");
    inResponse.header("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
    inResponse.header("Access-Control-Allow-Headers", "Origin,X-Requested-With,Content-Type,Accept");
    inNext();
});

// LIST MAILBOXES
app.get("/mailboxes",
async (inRequest: Request, inResponse: Response) => {
    try {
        const imapWorker: IMAP.Worker = new IMAP.Worker(serverInfo);
        const mailboxes: IMAP.IMailbox[] = await imapWorker.listMailboxes();
        console.log(mailboxes)
        inResponse.status(200).json(mailboxes);
    } catch (inError) {
        inResponse.status(500).send(inError)
    }
});

// LIST MESSAGES
app.get("/mailboxes/:mailbox",
async (inRequest: Request, inResponse: Response) => {
    try {
        const imapWorker: IMAP.Worker = new IMAP.Worker(serverInfo);
        const messages: IMAP.IMessage[] = await imapWorker.listMessages({
            mailbox: inRequest.params.mailbox
        });
        inResponse.status(200).json(messages);
    } catch (inError) {
        inResponse.status(500).send("error")
    }
});

// GET A MESSAGE
app.get("/messages/:mailbox/:id",
async (inRequest: Request, inResponse: Response) => {
    try {
        const imapWorker: IMAP.Worker = new IMAP.Worker(serverInfo);
        const messageBody: string = await imapWorker.getMessageBody({
            mailbox: inRequest.params.mailbox,
            id: parseInt(inRequest.params.id, 10)
        })
        inResponse.status(200).send(messageBody);
    } catch (inError) {
        inResponse.status(500).send("error")
    }
});

// DELETE A MESSAGE
app.delete("/messages/:mailbox/:id",
async (inRequest: Request, inResponse: Response) => {
    try {
        const imapWorker: IMAP.Worker = new IMAP.Worker(serverInfo);
        await imapWorker.deleteMessage({
            mailbox: inRequest.params.mailbox,
            id: parseInt(inRequest.params.id, 10)
        })
        inResponse.status(200).send("ok");
    } catch (inError) {
        inResponse.status(500).send("error")
    }
});

// SEND A MESSAGE
app.post("/messages",
async (inRequest: Request, inResponse: Response) => {
    try {
        const smtpWorker: SMTP.Worker = new SMTP.Worker(serverInfo);
        await smtpWorker.sendMessage(inRequest.body);
        inResponse.status(201).send("ok");
    } catch (inError) {
        inResponse.status(500).send("error")
    }
});

// LIST CONTACTS
app.get("/contacts",
async (inRequest: Request, inResponse: Response) => {
    try {
        const contactsWorker: Contacts.Worker = new Contacts.Worker();
        const contacts: IContact[] = await contactsWorker.listContacts();
        inResponse.status(200).json(contacts);
    } catch (inError) {
        inResponse.status(500).send("error")
    }
});

// CREATE A CONTACT
app.post("/contacts",
async (inRequest: Request, inResponse: Response) => {
    try {
        const contactsWorker: Contacts.Worker = new Contacts.Worker();
        const contact: IContact = await contactsWorker.addContact(inRequest.body)
        inResponse.status(201).json(contact);
    } catch (inError) {
        inResponse.status(500).send("error")
    }
});

// UPDATE A CONTACT
app.put("/contacts/:id/:name/:email",
async (inRequest: Request, inResponse: Response) => {
    let {id, name, email} = inRequest.params
    try {
        const contactsWorker: Contacts.Worker = new Contacts.Worker();
        await contactsWorker.updateContact(id, name, email)
        inResponse.status(201).json("ok");
    } catch (inError) {
        inResponse.status(500).send("error")
    }
});

// DELETE A CONTACT
app.delete("/contacts/:id",
async (inRequest: Request, inResponse: Response) => {
    try {
        const contactsWorker: Contacts.Worker = new Contacts.Worker();
        await contactsWorker.deleteContact(inRequest.params.id)
        inResponse.status(200).json("ok");
    } catch (inError) {
        inResponse.status(500).send("error")
    }
});

// Start app listening.
app.listen(80, () => {
    console.log("MailBag server open for requests");
  }); 