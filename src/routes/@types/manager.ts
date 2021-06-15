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