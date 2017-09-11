export interface IAdapterOptions {
    token: string;
    serviceID?: string;
    logLevel?: string;
}
export interface IUserInformations {
    readonly id: string;
    readonly username: string;
    readonly is_bot: boolean;
    readonly avatar: string;
}
export interface IChannelInformations {
    readonly guildID: string;
    readonly id: string;
    readonly name: string;
    readonly topic: string;
}
