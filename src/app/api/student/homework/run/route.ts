import { NextRequest, NextResponse } from 'next/server';
import { 
  requireRole, 
  withRateLimit, 
  withActivityLogging, 
  sanitizeSensitiveData,
  logSecurityEvent 
} from '@/lib/security';

// Run code for testing
export const POST = withRateLimit(
  requireRole(['STUDENT'])(
    withActivityLogging('STUDENT_CODE_RUN')(
      async (request: NextRequest) => {
        try {
          const user = (request as any).user;
          const { code, language, moduleId } = await request.json();

          if (!code || !language) {
            return NextResponse.json(
              { error: 'Code and language are required' },
              { status: 400 }
            );
          }

          // Basic code validation
          if (code.length > 10000) {
            return NextResponse.json(
              { error: 'Code is too long (max 10,000 characters)' },
              { status: 400 }
            );
          }

          // Simple code execution simulation
          // In a real implementation, you would use a sandboxed environment
          let results = [];
          
          try {
            if (language === 'javascript') {
              // Create a safe execution context
              const safeCode = `
                (function() {
                  const console = {
                    log: (...args) => args.join(' ')
                  };
                  
                  try {
                    ${code}
                    return { success: true, output: 'Code executed successfully' };
                  } catch (error) {
                    return { success: false, error: error.message };
                  }
                })()
              `;

              // Execute code in a controlled manner
              const result = eval(safeCode);
              
              results.push({
                passed: result.success,
                output: result.success ? result.output : undefined,
                error: result.success ? undefined : result.error
              });

            } else {
              results.push({
                passed: false,
                error: `Language ${language} is not supported yet`
              });
            }
          } catch (error) {
            results.push({
              passed: false,
              error: error instanceof Error ? error.message : 'Unknown execution error'
            });
          }

          const sanitizedData = sanitizeSensitiveData({
            success: true,
            results
          });

          return NextResponse.json(sanitizedData);

        } catch (error) {
          logSecurityEvent('STUDENT_CODE_RUN_ERROR', { 
            error: error instanceof Error ? error.message : 'Unknown error',
            userId: (request as any).user?.id
          }, request);
          
          return NextResponse.json(
            { error: 'Failed to run code' },
            { status: 500 }
          );
        }
      }
    )
  )
);
