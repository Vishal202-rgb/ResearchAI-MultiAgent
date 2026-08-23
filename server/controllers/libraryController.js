import SavedInsight from '../models/SavedInsight.js';
import SavedSource from '../models/SavedSource.js';

export const getInsights = async (req, res) => {
  try {
    const insights = await SavedInsight.find({ userId: req.user.id })
      .populate('workspaceId', 'title domain')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: insights });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const getSources = async (req, res) => {
  try {
    const sources = await SavedSource.find({ userId: req.user.id })
      .populate('workspaceId', 'title domain')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: sources });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const saveInsight = async (req, res) => {
  try {
    const { workspaceId, findingText, sourceReferences, tags, personalNote } = req.body;
    const newInsight = new SavedInsight({
      userId: req.user.id,
      workspaceId,
      findingText,
      sourceReferences: sourceReferences || [],
      tags: tags || [],
      personalNote: personalNote || ''
    });
    
    await newInsight.save();
    await newInsight.populate('workspaceId', 'title domain');
    
    res.status(201).json({ success: true, data: newInsight });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Insight already saved from this workspace' });
    }
    console.error("Save Insight Error:", error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const saveSource = async (req, res) => {
  try {
    const { workspaceId, title, url, publisher, date, tags, personalNote } = req.body;
    const newSource = new SavedSource({
      userId: req.user.id,
      workspaceId,
      title,
      url,
      publisher,
      date,
      tags: tags || [],
      personalNote: personalNote || ''
    });
    
    await newSource.save();
    await newSource.populate('workspaceId', 'title domain');
    
    res.status(201).json({ success: true, data: newSource });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Source already saved from this workspace' });
    }
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const updateInsight = async (req, res) => {
  try {
    const { tags, personalNote } = req.body;
    let insight = await SavedInsight.findOne({ _id: req.params.id, userId: req.user.id });
    
    if (!insight) return res.status(404).json({ success: false, message: 'Insight not found' });
    
    if (tags !== undefined) insight.tags = tags;
    if (personalNote !== undefined) insight.personalNote = personalNote;
    
    await insight.save();
    await insight.populate('workspaceId', 'title domain');
    
    res.json({ success: true, data: insight });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const updateSource = async (req, res) => {
  try {
    const { tags, personalNote } = req.body;
    let source = await SavedSource.findOne({ _id: req.params.id, userId: req.user.id });
    
    if (!source) return res.status(404).json({ success: false, message: 'Source not found' });
    
    if (tags !== undefined) source.tags = tags;
    if (personalNote !== undefined) source.personalNote = personalNote;
    
    await source.save();
    await source.populate('workspaceId', 'title domain');
    
    res.json({ success: true, data: source });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const deleteInsight = async (req, res) => {
  try {
    const insight = await SavedInsight.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!insight) return res.status(404).json({ success: false, message: 'Insight not found' });
    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const deleteSource = async (req, res) => {
  try {
    const source = await SavedSource.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!source) return res.status(404).json({ success: false, message: 'Source not found' });
    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
