import mongoose from "mongoose";

const Schema = mongoose.Schema;

const userSchema = new Schema({
  userName: { 
    type: String, 
    required: true,
    unique: true, 
  },
  email: { 
    type: String, 
    required: true,
    unique: true,
  },
  password: { 
    type: String, 
    required: true,
  },
  balance:{
    type: Number,
    required: true,
    default: 100000
  },
  roles: {
    type: [String],
    enum: ['user', 'admin', 'super_admin'],
    default: ['user'],
  },
  createdAt: { 
    type: Date, 
    default: Date.now, 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now,
  }
});

userSchema.pre('save', function(next){
  this.updatedAt = Date.now();
  next();
});

userSchema.pre('update', function() {
  this.update({}, { $set: { updatedAt: Date.now() } });
});

userSchema.pre('findOneAndUpdate', function() {
  this.update({}, { $set: { updatedAt: Date.now() } });
});

const User = mongoose.model('User', userSchema);
export default User;
