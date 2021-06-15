export interface RequestRegisterType{
    firstName  : string,
    lastName : string,
    gradeBookNumber  : string,
    password : string,
    confirmPassword : string
}

export interface SessionUserAuthData{
    gradeBookNumber : string,
    token : string,
    uuid : string,
    userId : string
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