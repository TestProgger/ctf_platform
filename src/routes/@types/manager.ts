export interface AdminKeyStore{
    token : string,
    uuid : string,
    signUUID : string
}

export interface ServerSideKeyStore {
    randomBytes : string,
    token : string,
    uuid : string
}

export interface FingerprintInterface {
        timezone : string
        screenConf : {
            width : number
            height : number
            colorDepth: number
            pixelDepth : number
        }
}