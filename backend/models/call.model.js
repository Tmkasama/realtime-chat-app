import mongoose from "mongoose";

const callSchema = new mongoose.Schema(
    {
        participants: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }],
        type: {
            type: String,
            enum: ["voice", "video"],
            required: true
        },
    },
    { timestamps: true }
);

const Call = mongoose.model("Call", callSchema);

export default Call;
