class ApiError extends Error{
    constructor(statusCode,message="Bekar msg something went wrong",errors=[],stack=""){
        super(message)
        this.statusCode=statusCode
        this.data=null
        this.message=message
        this.success= false
        this.errors = errors
    }
}

export {ApiError}