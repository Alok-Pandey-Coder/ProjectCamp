import mongoose, {Schema} from "mongoose";


const projectSchema = new Schema(
  {
    //name, description, createdBy, members
    name: {
      type: String,
      required: true,
      unique: true,
      minlength: 4,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 200,
      trim: true,
    },
    visibility: {
      type: String,
      enum: ['Public', 'Private'],
      default: 'Public',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'archived'],
      default: 'active',
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: 'ProjectMember',
        default: []
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export const Project = mongoose.model("Project", projectSchema)