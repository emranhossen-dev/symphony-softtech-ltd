const https = require('https');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/admin/courses?category=ONLINE',
  method: 'GET'
};

const req = https.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      console.log('API Response:');
      console.log('Success:', result.success);
      console.log('Total courses:', result.courses?.length || 0);
      
      if (result.courses) {
        result.courses.forEach(course => {
          console.log(`\nCourse: ${course.title}`);
          console.log(`ID: ${course.id}`);
          console.log(`Module count: ${course._count?.modules || 0}`);
          console.log(`Enrollment count: ${course._count?.enrollments || 0}`);
        });
      }
    } catch (error) {
      console.error('Error parsing JSON:', error);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('Request error:', error);
});

req.end();
