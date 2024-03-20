import express from 'express';
import axios from 'axios';

const app = express();
const PORT = process.env.PORT || 9876;
const WINDOW_SIZE = 10;
let numbersWindow = [];
let sum = 0;

// Middleware to ensure the server responds within 500ms
app.use((requset, response, next) => {
  const start = Date.now();
  response.on('finish', () => {
    const duration = Date.now() - start;
    if (duration > 500) {
      console.log(`Warning: Response time exceeded 500ms: ${duration}ms`);
    }
  });
  next();
});

// fetching number from API
async function fetchNumbers(url) {
  try {
    const response = await axios.get(url);
    const numbers = response.data.numbers;
    return numbers.filter(num => !numbersWindow.includes(num));
    
  }
  catch{
    console.error('Error fetching numbers:', error.message);
    return [];
  }
}

// calculate Average of number Series
function calculateAverage() {
  if (numbersWindow.length === 0) return 0;
  return sum / numbersWindow.length;
}


app.get('/numbers/:numberid', async (request, response) => {
  const { numberid } = request.params;
  let url;

  
  switch (numberid) {
    case 'p':
      url = 'http://20.244.56.144/numbers/primes';
      break;
    case 'f':
      url = 'http://20.244.56.144/numbers/fibo';
      break;
    case 'e':
      url = 'http://20.244.56.144/numbers/even';
      break;
    case 'r':
      url = 'http://20.244.56.144/numbers/random';
      break;
    default:
      return res.status(400).json({ error: 'Invalid numberid' });
  }

  const fetchedNumbers = await fetchNumbers(url);
  console.log(fetchedNumbers)
  
  if (numbersWindow.length >= WINDOW_SIZE) {
    const removedNumber = numbersWindow.shift();
    sum -= removedNumber;
  }

 
  for (const num of fetchedNumbers) {
    if (numbersWindow.length < WINDOW_SIZE) {
      numbersWindow.push(num);
      sum += num;
    } 
  }

 
  const average = calculateAverage();
  response.json({
    numbers: fetchedNumbers,
     windowPrevState: numbersWindow.slice(0, numbersWindow.length - fetchedNumbers.length),
    windowCurrState: numbersWindow,
    avg: average.toFixed(2)
  });
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
