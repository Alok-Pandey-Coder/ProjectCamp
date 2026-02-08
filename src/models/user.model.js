import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
import crypto from "crypto"

const userSchema = new Schema(
  {
    avatar: {
      type: String,
      trim: true,
      default: '',
      maxlength: 500,
      validate: {
        validator: function (value) {
          if (!value) return true;
          return /^(https?:\/\/.*\.(png|jpg|jpeg|webp))$/i.test(value);
        },
        message: 'Avatar must be a valid image URL',
      },
    },
    username: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      lowercase: true,
      minlength: [3, 'Username should contain at least 3 characters'],
      maxlength: [20, 'Username should contain upto 20 characters'],
      match: /^[a-z][a-z0-9._]*$/,
      validate: {
        validator: function (value) {
          return !/[._]{2,}/.test(value);
        },
        message: 'Username cannot contain consecutive dots or underscores',
      },
    },
    fullname: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
      match: /^[a-zA-ZÀ-ž\s'-]+$/,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      maxlength: 128,
      validate: {
        validator: function (value) {
          return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(
            value,
          );
        },
        message:
          'Password must contain uppercase, lowercase, number, and special character',
      },
      select: false, // VERY IMPORTANT
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      index: true,
      trim: true,
      lowercase: true,
      maxlength: [254, 'Email is too long'],
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
        'Please provide a valid email address',
      ],
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
      select: false, // never return it by default
      trim: true,
      maxlength: 512,
    },
    emailVerificationToken: {
      type: String,
      select: false,
    },
    emailVerificationExpiry: {
      type: Date,
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    forgotPasswordToken: {
      type: String,
    },
    forgotPasswordExpiry: {
      type: Date,
    },
    role: {
      type: String,
      default: 'member',
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function() {
  if(!this.isModified("password")) return ;
  this.password = await bcrypt.hash(this.password, 10)
})

userSchema.methods.generateAccessToken = function() {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY },
  );
}

userSchema.methods.isPasswordCorrect = async function(password) {
  return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateRefreshToken = function() {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY },
  );
}

userSchema.methods.generateTemporaryToken = function() {
  const unHashedToken = crypto.randomBytes(20).toString('hex');

  const hashedToken = crypto
    .createHash('sha256')
    .update(unHashedToken)
    .digest('hex');

  const tokenExpiry = Date.now() + 20 * 60 * 1000; //20min
  return { unHashedToken, hashedToken, tokenExpiry };
}

export const User = mongoose.model("User", userSchema)