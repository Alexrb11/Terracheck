import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema({
  recipient: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['new_post', 'like_post', 'friend_request', 'friend_accept'], 
    required: true 
  },
  activity: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Activity' 
  }, // Opcional, para likes/posts
  isRead: { 
    type: Boolean, 
    default: false 
  }
}, { timestamps: true })

// Optimizar queries
notificationSchema.index({ recipient: 1, createdAt: -1 })
notificationSchema.index({ recipient: 1, isRead: 1 })

export default mongoose.model('Notification', notificationSchema)
