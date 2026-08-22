import Workspace from '../models/Workspace.js';
import Report from '../models/Report.js';
import ResearchFinding from '../models/ResearchFinding.js';
import Source from '../models/Source.js';
import ResearchRun from '../models/ResearchRun.js';
import AppError from '../utils/AppError.js';
import { generateReportContent } from '../services/report/reportService.js';
import { marked } from 'marked';

export const generateReport = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;
    
    const workspace = await Workspace.findOne({ _id: workspaceId, userId: req.user._id });
    if (!workspace) return next(new AppError('Workspace not found', 404));

    const run = await ResearchRun.findOne({ workspaceId, status: 'completed' }).sort({ createdAt: -1 });
    if (!run) return next(new AppError('No completed research run found', 400));

    const findings = await ResearchFinding.findOne({ researchRunId: run._id });
    const sources = await Source.find({ researchRunId: run._id });
    
    if (!findings) return next(new AppError('No findings available', 400));

    const reportData = await generateReportContent(workspace, findings, sources);

    // Save report
    await Report.deleteMany({ researchRunId: run._id }); // Replace old report for this run
    
    const report = await Report.create({
      workspaceId,
      userId: req.user._id,
      researchRunId: run._id,
      title: reportData.title || `${workspace.title} - Final Report`,
      executiveSummary: reportData.executiveSummary || '',
      methodology: reportData.methodology || '',
      detailedAnalysis: reportData.detailedAnalysis || '',
      conclusion: reportData.conclusion || '',
      markdown: reportData.markdown || '',
    });

    res.status(201).json({
      success: true,
      data: { report }
    });
  } catch (error) {
    next(error);
  }
};

export const getReport = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;
    const report = await Report.findOne({ workspaceId, userId: req.user._id }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: { report }
    });
  } catch (error) {
    next(error);
  }
};

export const exportReportPDF = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;
    const report = await Report.findOne({ workspaceId, userId: req.user._id }).sort({ createdAt: -1 });
    if (!report) return next(new AppError('Report not found', 404));

    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; color: #333; }
            h1, h2, h3 { color: #111; }
            a { color: #0066cc; }
            blockquote { border-left: 4px solid #ccc; padding-left: 10px; color: #666; }
          </style>
        </head>
        <body>
          ${marked(report.markdown)}
        </body>
      </html>
    `;

    const file = { content: htmlContent };
    const options = { format: 'A4', margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' } };

    // Dynamically import to avoid Puppeteer/Vercel serverless limits on cold start
    const pdf = (await import('html-pdf-node')).default;

    pdf.generatePdf(file, options).then(pdfBuffer => {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${report.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf"`);
      res.send(pdfBuffer);
    }).catch(err => {
      console.error(err);
      next(new AppError('Failed to generate PDF', 500));
    });
  } catch (error) {
    next(error);
  }
};

export const compareWorkspaces = async (req, res, next) => {
  try {
    const { ws1, ws2 } = req.query;
    if (!ws1 || !ws2) return next(new AppError('Two workspace IDs are required', 400));

    const { default: Workspace } = await import('../models/Workspace.js');

    const [w1, w2] = await Promise.all([
      Workspace.findOne({ _id: ws1, userId: req.user._id }),
      Workspace.findOne({ _id: ws2, userId: req.user._id })
    ]);

    if (!w1 || !w2) return next(new AppError('One or both workspaces not found or unauthorized', 404));

    const finding1 = await ResearchFinding.findOne({ workspaceId: ws1 }).sort({ createdAt: -1 }).populate('workspaceId', 'title');
    const finding2 = await ResearchFinding.findOne({ workspaceId: ws2 }).sort({ createdAt: -1 }).populate('workspaceId', 'title');

    if (!finding1 || !finding2) return next(new AppError('Research findings not found for one or both workspaces', 404));

    const prompt = `Compare these two research workspaces and provide a detailed synthesis.

Workspace 1: ${finding1.workspaceId.title}
Summary: ${finding1.summary}
Findings: ${(finding1.keyFindings || []).join('; ')}

Workspace 2: ${finding2.workspaceId.title}
Summary: ${finding2.summary}
Findings: ${(finding2.keyFindings || []).join('; ')}

Analyze them and return ONLY a JSON response in the following format. Do not use markdown blocks around the JSON.
{
  "similarities": ["point 1", "point 2"],
  "differences": ["point 1", "point 2"],
  "conflictingFindings": ["point 1"],
  "conclusion": "Overall synthesis paragraph"
}`;

    const { default: callGemini } = await import('../services/ai/geminiService.js');
    const result = await callGemini(prompt, { temperature: 0.2 });

    res.status(200).json({
      success: true,
      data: { comparison: result, ws1Title: finding1.workspaceId.title, ws2Title: finding2.workspaceId.title }
    });
  } catch (error) {
    next(error);
  }
};
