import ChatMessage from '../models/ChatMessage.js';
import Workspace from '../models/Workspace.js';
import AppError from '../utils/AppError.js';
import { handleChatMessage } from '../services/chat/chatService.js';

export const getMessages = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;
    const messages = await ChatMessage.find({ workspaceId, userId: req.user._id }).sort({ createdAt: 1 });
    
    res.status(200).json({
      success: true,
      data: { messages }
    });
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;
    const { message } = req.body;

    if (!message) {
      return next(new AppError('Message is required', 400));
    }

    const workspace = await Workspace.findOne({ _id: workspaceId, userId: req.user._id });
    if (!workspace) return next(new AppError('Workspace not found', 404));

    // Save user message
    const userMessage = await ChatMessage.create({
      workspaceId,
      userId: req.user._id,
      role: 'user',
      content: message
    });

    // Generate assistant response
    const assistantMessage = await handleChatMessage(workspaceId, req.user._id, message);

    res.status(200).json({
      success: true,
      data: { 
        userMessage,
        assistantMessage
      }
    });
  } catch (error) {
    next(error);
  }
};
