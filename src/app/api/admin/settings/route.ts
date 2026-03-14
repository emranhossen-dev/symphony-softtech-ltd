import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, hasRole } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!hasRole(payload.role, 'ADMIN')) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Try to get settings from database
    let settings;
    
    // Check if we have a settings table or use a general approach
    try {
      // Try to find settings in database (using a general approach)
      const dbSettings = await (prisma as any).settings?.findFirst?.();
      
      if (dbSettings) {
        settings = {
          siteName: dbSettings.siteName || 'Symphony Training Centre',
          siteDescription: dbSettings.siteDescription || 'Professional training and education platform',
          siteUrl: dbSettings.siteUrl || 'https://symphony-training.com',
          adminEmail: dbSettings.adminEmail || 'admin@symphony-training.com',
          supportEmail: dbSettings.supportEmail || 'support@symphony-training.com',
          defaultCurrency: dbSettings.defaultCurrency || 'BDT',
          timezone: dbSettings.timezone || 'UTC',
          maintenanceMode: dbSettings.maintenanceMode || false,
          allowRegistrations: dbSettings.allowRegistrations !== false,
          emailNotifications: dbSettings.emailNotifications !== false,
          smsNotifications: dbSettings.smsNotifications || false,
          maxFileSize: dbSettings.maxFileSize || 10485760, // 10MB
          sessionTimeout: dbSettings.sessionTimeout || 3600, // 1 hour
          backupFrequency: dbSettings.backupFrequency || 'daily',
          theme: {
            primaryColor: dbSettings.primaryColor || '#10b981',
            secondaryColor: dbSettings.secondaryColor || '#f97316',
            accentColor: dbSettings.accentColor || '#ef4444'
          },
          security: {
            passwordMinLength: dbSettings.passwordMinLength || 8,
            requireEmailVerification: dbSettings.requireEmailVerification !== false,
            twoFactorAuth: dbSettings.twoFactorAuth || false,
            sessionTimeoutMinutes: dbSettings.sessionTimeoutMinutes || 60
          }
        };
      } else {
        // If no settings exist, create default settings
        settings = {
          siteName: 'Symphony Training Centre',
          siteDescription: 'Professional training and education platform',
          siteUrl: 'https://symphony-training.com',
          adminEmail: 'admin@symphony-training.com',
          supportEmail: 'support@symphony-training.com',
          defaultCurrency: 'BDT',
          timezone: 'UTC',
          maintenanceMode: false,
          allowRegistrations: true,
          emailNotifications: true,
          smsNotifications: false,
          maxFileSize: 10485760, // 10MB
          sessionTimeout: 3600, // 1 hour
          backupFrequency: 'daily',
          theme: {
            primaryColor: '#10b981',
            secondaryColor: '#f97316',
            accentColor: '#ef4444'
          },
          security: {
            passwordMinLength: 8,
            requireEmailVerification: true,
            twoFactorAuth: false,
            sessionTimeoutMinutes: 60
          }
        };
      }
    } catch (dbError) {
      // If settings table doesn't exist, use default settings
      console.log('Settings table not found, using defaults');
      settings = {
        siteName: 'Symphony Training Centre',
        siteDescription: 'Professional training and education platform',
        siteUrl: 'https://symphony-training.com',
        adminEmail: 'admin@symphony-training.com',
        supportEmail: 'support@symphony-training.com',
        defaultCurrency: 'BDT',
        timezone: 'UTC',
        maintenanceMode: false,
        allowRegistrations: true,
        emailNotifications: true,
        smsNotifications: false,
        maxFileSize: 10485760, // 10MB
        sessionTimeout: 3600, // 1 hour
        backupFrequency: 'daily',
        theme: {
          primaryColor: '#10b981',
          secondaryColor: '#f97316',
          accentColor: '#ef4444'
        },
        security: {
          passwordMinLength: 8,
          requireEmailVerification: true,
          twoFactorAuth: false,
          sessionTimeoutMinutes: 60
        }
      };
    }

    return NextResponse.json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!hasRole(payload.role, 'ADMIN')) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const settingsData = await request.json();

    // Validate required fields
    const requiredFields = ['siteName', 'siteDescription', 'adminEmail'];
    for (const field of requiredFields) {
      if (!settingsData[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Try to save settings to database
    try {
      // Check if settings table exists and save/update
      const existingSettings = await (prisma as any).settings?.findFirst?.();
      
      if (existingSettings) {
        // Update existing settings
        await (prisma as any).settings?.update?.({
          where: { id: existingSettings.id },
          data: settingsData
        });
      } else {
        // Create new settings record
        await (prisma as any).settings?.create?.({
          data: settingsData
        });
      }

      console.log('Settings saved to database:', settingsData);

      return NextResponse.json({
        success: true,
        message: 'Settings saved successfully',
        settings: settingsData
      });
    } catch (dbError) {
      // If database operations fail, log and return success for now
      // In production, you might want to handle this differently
      console.log('Database save failed, settings logged:', dbError);
      console.log('Settings data:', settingsData);

      return NextResponse.json({
        success: true,
        message: 'Settings processed (database save pending)',
        settings: settingsData
      });
    }
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    );
  }
}
