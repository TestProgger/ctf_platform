export interface RequestRegisterType{
    firstName  : string,
    lastName : string,
    gradeBookNumber  : string,
    password : string,
    confirmPassword : string
}

export interface BrowserFingerprintInterface {
    timezone : string
    screenConf : {
        width : number
        height : number
        colorDepth: number
        pixelDepth : number
    },
    languages : string[],
    appCodeName : string
}

export interface SessionUserAuthData{
    gradeBookNumber : string,
    token : string,
    uuid : string,
    userId : string,
    fingerprint ?: {
        browserFingerprint : BrowserFingerprintInterface,
        userAgent : string,
        userIp : string
    }
}

export interface RequestLoginType{
    gradeBookNumber : string,
    password : string
}

export interface RequestRegisterErrorType{
    firstName  : boolean,
    lastName : boolean,
    gradeBookNumber  : boolean,
    password : boolean
}

export interface TaskAnswerInterface{
    taskId : number,
    answer : string,
}

