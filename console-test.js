// Copy this script and paste it in the browser console on the admin page
(async () => {
  console.log('🧪 Direct POST Test Starting...');
  
  // Get token from cookie
  const cookieToken = document.cookie
    .split(';')
    .find(c => c.trim().startsWith('auth-token='))
    ?.split('=')[1];
  
  console.log('🔍 Cookie token:', !!cookieToken);
  console.log('🔍 Token length:', cookieToken?.length || 0);
  console.log('🔍 Token preview:', cookieToken?.substring(0, 30) + '...');
  
  if (!cookieToken) {
    console.error('❌ No token found in cookies');
    return;
  }
  
  const courseId = 'cmmh39nhd000flnx3e69ja0ob';
  const testModule = {
    title: 'Debug Test Module ' + Date.now(),
    videoUrl: 'https://test.com/video.mp4',
    homework: 'Test homework',
    order: 999,
    isLocked: true
  };
  
  console.log('🚀 Sending POST request...');
  console.log('📦 Module data:', testModule);
  
  try {
    const response = await fetch(`/api/admin/courses/${courseId}/modules`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cookieToken}`
      },
      body: JSON.stringify(testModule)
    });
    
    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('📡 Response body:', responseText);
    
    if (response.ok) {
      console.log('✅ SUCCESS: Module created!');
    } else {
      console.error('❌ FAILED: Module creation failed');
    }
  } catch (error) {
    console.error('❌ ERROR:', error);
  }
})();
