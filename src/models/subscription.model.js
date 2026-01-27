import mongoose,{Schema} from "mongoose";

 const subscriptionSchema=new Schema({
    subscriber:{  //the one who subscribes to a channel
        type: Schema.Types.ObjectId,
        ref:"User",
    
    },
    channel:{      //to whom the user is subscribed to
        type: Schema.Types.ObjectId,
        ref:"User"}   
    },
    {timestamps:true})

export const Subscription=mongoose.model("Subscription",subscriptionSchema);