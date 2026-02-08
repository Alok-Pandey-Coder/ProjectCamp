import mongoose from 'mongoose';

const projectMemberSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
    },

    role: {
      type: String,
      enum: ['admin', 'project-admin', 'member', 'viewer'],
      default: 'member',
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);


export const ProjectMember = mongoose.model(
  'ProjectMember',
  projectMemberSchema,
);
