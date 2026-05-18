"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Input } from '@/components/ui/Input';
import { 
  Bot,
  Sparkles,
  Wand2,
  Copy,
  CheckCircle,
  Brain,
  BookOpen,
  Target,
  Zap,
  Loader2,
  RefreshCw,
  Lightbulb,
  GraduationCap
} from 'lucide-react';
import toast from 'react-hot-toast';

interface GeneratedModule {
  title: string;
  description: string;
  homework: string;
  videoPlaceholder: string;
  estimatedDuration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  topics?: string[];
}

interface AIModuleGeneratorProps {
  onModulesGenerated: (modules: GeneratedModule[]) => void;
  courseTitle?: string;
}

const COURSE_TEMPLATES = {
  'Web Development': [
    'HTML - HyperText Markup Language',
    'CSS - Cascading Style Sheets', 
    'Bootstrap - CSS Framework',
    'Tailwind CSS - Utility-First CSS Framework',
    'JavaScript - Programming Language of the Web',
    'TypeScript - Typed JavaScript',
    'React - JavaScript UI Library',
    'Next.js - React Full-Stack Framework',
    'Express.js - Node.js Web Framework',
    'MongoDB - NoSQL Document Database'
  ],
  'Digital Marketing': [
    'Marketing Fundamentals',
    'Social Media Marketing',
    'Content Marketing',
    'SEO Basics',
    'Google Ads',
    'Facebook Marketing',
    'Email Marketing',
    'Analytics & Tracking',
    'Conversion Optimization',
    'Campaign Strategy'
  ],
  'Graphic Design': [
    'Design Principles',
    'Color Theory',
    'Typography',
    'Adobe Photoshop Basics',
    'Adobe Illustrator',
    'Logo Design',
    'Web Design Basics',
    'Social Media Graphics',
    'Portfolio Building',
    'Client Projects'
  ]
};

const DETAILED_TOPICS = {
  'HTML - HyperText Markup Language': [
    'Introduction to HTML & How Web Works',
    'HTML Document Structure — DOCTYPE, html, head, body',
    'Headings, Paragraphs & Text Formatting Tags',
    'Links & Anchor Tags — href, target, rel',
    'Images — img, src, alt, width, height, srcset',
    'Ordered, Unordered & Description Lists',
    'HTML Tables — thead, tbody, tfoot, colspan, rowspan',
    'HTML Forms — input types, label, select, textarea',
    'HTML5 Form Validation — required, pattern, min, max',
    'Semantic HTML5 Elements — header, nav, main, article, section, footer',
    'HTML5 Media — video, audio, source, iframe',
    'Accessibility & ARIA Roles — aria-label, tabindex, skip links',
    'Meta Tags, SEO Basics & Open Graph',
    'HTML Canvas & Inline SVG Introduction',
    'Browser DevTools — Inspecting & Debugging HTML'
  ],
  'CSS - Cascading Style Sheets': [
    'CSS Syntax, Linking Methods & How Cascade Works',
    'CSS Selectors — element, class, id, universal, attribute',
    'Combinators — descendant, child, adjacent, sibling',
    'Pseudo-classes — :hover, :focus, :nth-child, :not, :checked',
    'Pseudo-elements — ::before, ::after, ::placeholder',
    'Specificity, Inheritance & !important Rule',
    'CSS Box Model — content, padding, border, margin, box-sizing',
    'Colors — hex, rgb/rgba, hsl, CSS Custom Properties',
    'Typography — font-family, size, weight, line-height, Google Fonts',
    'Text Properties — align, decoration, transform, letter-spacing',
    'CSS Variables (Custom Properties) — var(), :root, fallback values',
    'Display & Positioning — block, inline, inline-block, relative, absolute, fixed, sticky',
    'CSS Flexbox — container & item properties, practical layout patterns',
    'CSS Grid — template columns/rows, areas, auto-fill, minmax()',
    'Flexbox vs Grid — when to use each, combining both',
    'Responsive Design & Media Queries — mobile-first approach',
    'CSS Transitions — property, duration, timing-function, delay',
    'CSS Animations — @keyframes, animation shorthand, fill-mode',
    'CSS Transform — translate, scale, rotate, skew, 3D transforms',
    'CSS Filter, Backdrop-filter & Blend Modes',
    'CSS Overflow, Z-index & Stacking Context',
    'CSS Clip-path, Shapes & Masking'
  ],
  'JavaScript - Programming Language of the Web': [
    'JavaScript Introduction — History, Engines, How JS Runs',
    'Variables — var, let, const; Temporal Dead Zone',
    'Data Types — string, number, boolean, null, undefined, symbol, BigInt',
    'Operators — arithmetic, comparison (== vs ===), logical, ternary, nullish ??',
    'Type Coercion — implicit vs explicit; Number(), String(), Boolean()',
    'Control Flow — if/else, switch/case, for, while, do-while',
    'Functions — declaration, expression, arrow functions, default params',
    'Scope, Closures & Hoisting',
    'Arrays & Array Methods — map, filter, reduce, find, flat, sort',
    'Objects, Object Methods & Computed Property Names',
    'Destructuring — arrays, objects, nested, defaults, rename',
    'Spread & Rest Operator',
    'ES6 Classes — constructor, methods, static, extends, super',
    'Modules — export/import (named & default), dynamic import()',
    'Prototypes & Prototype Chain',
    'Callbacks, Callback Hell & Error-first Pattern',
    'Promises — .then(), .catch(), Promise.all, Promise.race',
    'Async / Await & try/catch Error Handling',
    'DOM Manipulation — querySelector, createElement, classList',
    'Events — addEventListener, bubbling, delegation, event object',
    'Fetch API — GET, POST, headers, response handling',
    'Local Storage & Session Storage',
    'Browser APIs — Timers, History, Geolocation, Clipboard',
    'Error Handling — Error types, custom errors, throwing',
    'Regular Expressions (RegEx) Basics',
    'JavaScript Design Patterns — Module, Factory, Observer'
  ]
};

export default function AIModuleGenerator({ onModulesGenerated, courseTitle }: AIModuleGeneratorProps) {
  const [courseTopic, setCourseTopic] = useState(courseTitle || '');
  const [userInput, setUserInput] = useState('');
  const [generatedModules, setGeneratedModules] = useState<GeneratedModule[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  const generateHomework = (moduleTitle: string, difficulty: string) => {
    const homeworkTemplates = {
      'Beginner': [
        `Create a simple project demonstrating ${moduleTitle.toLowerCase()} concepts.`,
        `Write a summary of what you learned about ${moduleTitle.toLowerCase()}.`,
        `Complete practice exercises related to ${moduleTitle.toLowerCase()}.`,
        `Watch additional tutorials and share your notes.`
      ],
      'Intermediate': [
        `Build a medium-complexity project using ${moduleTitle.toLowerCase()} techniques.`,
        `Analyze and improve an existing ${moduleTitle.toLowerCase()} project.`,
        `Create a tutorial explaining ${moduleTitle.toLowerCase()} concepts.`,
        `Solve challenging problems related to ${moduleTitle.toLowerCase()}.`
      ],
      'Advanced': [
        `Develop a professional-level ${moduleTitle.toLowerCase()} application.`,
        `Research and present advanced ${moduleTitle.toLowerCase()} techniques.`,
        `Contribute to an open-source ${moduleTitle.toLowerCase()} project.`,
        `Create a comprehensive case study on ${moduleTitle.toLowerCase()}.`
      ]
    };

    const templates = homeworkTemplates[difficulty as keyof typeof homeworkTemplates] || homeworkTemplates['Beginner'];
    return templates[Math.floor(Math.random() * templates.length)];
  };

  const generateDescription = (moduleTitle: string) => {
    const descriptions = [
      `Master the fundamentals of ${moduleTitle.toLowerCase()} with hands-on exercises.`,
      `Deep dive into ${moduleTitle.toLowerCase()} and build practical skills.`,
      `Learn ${moduleTitle.toLowerCase()} through real-world projects and examples.`,
      `Comprehensive guide to ${moduleTitle.toLowerCase()} with best practices.`,
      `Explore ${moduleTitle.toLowerCase()} concepts and their applications.`
    ];
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  };

  const getDifficulty = (index: number, totalModules: number) => {
    if (index < totalModules * 0.3) return 'Beginner';
    if (index < totalModules * 0.7) return 'Intermediate';
    return 'Advanced';
  };

  const generateModules = async () => {
    if (!courseTopic.trim() && !userInput.trim()) {
      toast.error('Please provide a course topic or module list');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      let moduleTitles: string[] = [];
      let detailedModules: GeneratedModule[] = [];

      // Parse detailed user input (like the Web Development curriculum)
      if (userInput.trim()) {
        const lines = userInput.split('\n').map(line => line.trim());
        let currentModule: GeneratedModule | null = null;
        
        for (const line of lines) {
          // Detect module headers (Module 01, Module 02, etc.)
          const moduleMatch = line.match(/^Module\s+\d+[:\s]*(.+)$/i);
          if (moduleMatch) {
            if (currentModule) {
              detailedModules.push(currentModule);
            }
            
            const moduleTitle = moduleMatch[1].trim();
            const difficulty = getDifficulty(detailedModules.length, lines.length);
            
            currentModule = {
              title: moduleTitle,
              description: generateDescription(moduleTitle),
              homework: generateHomework(moduleTitle, difficulty),
              videoPlaceholder: `https://example.com/videos/${moduleTitle.toLowerCase().replace(/\s+/g, '-')}-tutorial.mp4`,
              estimatedDuration: estimateDuration(moduleTitle),
              difficulty
            };
          }
          // Detect topics within modules (01, 02, etc.)
          else if (currentModule && /^\d+\s+/.test(line)) {
            // This is a subtopic, add to topics array
            const topic = line.replace(/^\d+\s+/, '').trim();
            if (!currentModule.topics) {
              currentModule.topics = [];
            }
            currentModule.topics.push(topic);
            currentModule.description += `\n• ${topic}`;
          }
        }
        
        if (currentModule) {
          detailedModules.push(currentModule);
        }
      }
      
      // If we found detailed modules, use them
      if (detailedModules.length > 0) {
        setGeneratedModules(detailedModules);
        toast.success(`Parsed ${detailedModules.length} detailed modules! 🎉`);
      } else {
        // Extract module titles from user input or use template
        if (userInput.trim()) {
          moduleTitles = userInput.split('\n')
            .map(line => line.replace(/^[-•*]\s*/, '').trim())
            .filter(line => line.length > 0);
        } else if (selectedTemplate && COURSE_TEMPLATES[selectedTemplate as keyof typeof COURSE_TEMPLATES]) {
          moduleTitles = COURSE_TEMPLATES[selectedTemplate as keyof typeof COURSE_TEMPLATES];
        } else {
          // Generate generic modules based on course topic
          moduleTitles = [
            `Introduction to ${courseTopic}`,
            `${courseTopic} Fundamentals`,
            `Practical ${courseTopic} Applications`,
            `Advanced ${courseTopic} Concepts`,
            `${courseTopic} Project Work`,
            `${courseTopic} Best Practices`,
            `Real-world ${courseTopic} Implementation`,
            `${courseTopic} Mastery`
          ];
        }

        const modules: GeneratedModule[] = moduleTitles.map((title, index) => {
          const difficulty = getDifficulty(index, moduleTitles.length);
          
          return {
            title: title.trim(),
            description: generateDescription(title),
            homework: generateHomework(title, difficulty),
            videoPlaceholder: `https://example.com/videos/${title.toLowerCase().replace(/\s+/g, '-')}-tutorial.mp4`,
            estimatedDuration: estimateDuration(title),
            difficulty
          };
        });

        setGeneratedModules(modules);
        toast.success(`Generated ${modules.length} modules successfully! 🎉`);
      }
    } catch (error) {
      toast.error('Failed to generate modules. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const estimateDuration = (moduleTitle: string): string => {
    const title = moduleTitle.toLowerCase();
    
    // Estimate duration based on module title complexity
    if (title.includes('introduction') || title.includes('basics')) {
      return '30-45 minutes';
    } else if (title.includes('advanced') || title.includes('mastery') || title.includes('project')) {
      return '90-120 minutes';
    } else if (title.includes('javascript') || title.includes('react') || title.includes('node')) {
      return '60-90 minutes';
    } else if (title.includes('html') || title.includes('css')) {
      return '45-60 minutes';
    } else {
      return '45-75 minutes';
    }
  };

  const applyModules = () => {
    if (generatedModules.length === 0) {
      toast.error('No modules to apply');
      return;
    }

    onModulesGenerated(generatedModules);
    toast.success('Modules applied to course! ✨');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const regenerateModules = () => {
    setGeneratedModules([]);
    generateModules();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl shadow-lg">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                AI Module Generator
              </CardTitle>
              <p className="text-gray-600 text-sm">Let AI create perfect modules for your course</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Input Section */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            Tell AI About Your Course
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course Topic
            </label>
            <Input
              value={courseTopic}
              onChange={(e) => setCourseTopic(e.target.value)}
              placeholder="e.g., Web Development, Digital Marketing, Graphic Design"
              className="w-full"
            />
          </div>

          {/* Quick Templates */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Lightbulb className="w-4 h-4 inline mr-1" />
              Quick Templates (Optional)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {Object.keys(COURSE_TEMPLATES).map((template) => (
                <Button
                  key={template}
                  variant={selectedTemplate === template ? "default" : "outline"}
                  onClick={() => {
                    setSelectedTemplate(template);
                    setCourseTopic(template);
                  }}
                  className="text-sm"
                >
                  {template}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Brain className="w-4 h-4 inline mr-1" />
              Course Curriculum (Paste your detailed curriculum)
            </label>
            <Textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Module 01&#9;HTML&#10;HyperText Markup Language · 15 Topics&#10;01&#9;Introduction to HTML & How Web Works&#10;02&#9;HTML Document Structure — DOCTYPE, html, head, body&#10;03&#9;Headings, Paragraphs & Text Formatting Tags&#10;...&#10;&#10;Module 02&#9;CSS&#10;Cascading Style Sheets · 22 Topics&#10;01&#9;CSS Syntax, Linking Methods & How Cascade Works&#10;...&#10;&#10;OR simply list:&#10;• HTML Basics&#10;• CSS Fundamentals&#10;• JavaScript Introduction&#10;• React Basics"
              rows={8}
              className="w-full font-mono text-sm"
            />
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800">
                <strong>💡 Smart Parsing:</strong> AI can understand detailed curriculums with modules and topics! 
                Just paste your complete course structure and AI will organize it perfectly.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={generateModules}
              disabled={isGenerating}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  AI is Thinking...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  Generate Modules
                </>
              )}
            </Button>

            {generatedModules.length > 0 && (
              <Button
                variant="outline"
                onClick={regenerateModules}
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Regenerate
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Generated Modules */}
      {generatedModules.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                Generated Modules ({generatedModules.length})
              </CardTitle>
              <Button
                onClick={applyModules}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4" />
                Apply All Modules
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {generatedModules.map((module, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-xl p-4 bg-gradient-to-r from-gray-50 to-white hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{module.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            module.difficulty === 'Beginner' ? 'bg-green-100 text-green-700' :
                            module.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {module.difficulty}
                          </span>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            {module.estimatedDuration}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(module.title)}
                      className="p-1"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>

                  <p className="text-sm text-gray-600 mb-3">{module.description}</p>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">Homework Assignment</span>
                    </div>
                    <p className="text-sm text-blue-800">{module.homework}</p>
                  </div>

                  <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                    <Zap className="w-3 h-3" />
                    <span>Video: {module.videoPlaceholder}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl">
              <div className="flex items-center gap-3 text-green-800">
                <GraduationCap className="w-5 h-5" />
                <span className="font-medium">Ready to Apply!</span>
              </div>
              <p className="text-sm text-green-700 mt-1">
                Click "Apply All Modules" to add these {generatedModules.length} AI-generated modules to your course.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
