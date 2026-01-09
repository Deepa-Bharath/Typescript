// Getting the most frequent number
function mostFrequent(nums: number[]): number {
  let maxCount = 0;
  let result = nums[0];

  for (const n of nums) {
    let count = 0;
    for (const m of nums) {
      if (m === n) count++;
    }
    if (count > maxCount) {
      maxCount = count;
      result = n;
    }
  }

  return result;
}

function optimizedMostFrequent(nums: number[]): number {
    const mapNumber = new Map<number,number>();
    let maxCount:number = 0;
    let result:number = nums[0];
    for (const value of nums) {
      let count:number = 1;
      count = (mapNumber.get(value) ?? 0) + 1;
      mapNumber.set(value, count);
       if (count > maxCount) {
      maxCount = count;
      result = value;
    }
    }
   return result;
}
// Intersection of array
function intersection(a: number[], b: number[]): number[] {
  const result: number[] = [];

  for (const x of a) {
    for (const y of b) {
      if (x === y) {
        result.push(x);
      }
    }
  }

  return result;
}

function intersectionOptimized(a: number[], b: number[]): number[] {
  const setOne = new Set<number>(a);
  const setTwo = new Set<number>(b);
  const result: number[] = [];
  for (const one of setOne ) {
    (setTwo.has(one)) && result.push(one);
  }
  return result;
}

// Parallel fetching
async function fetchUserDetails(userIds: number[]) {
  const result = [];

  for (const id of userIds) {
    const profile = await fetchProfile(id);
    const orders = await fetchOrders(id);
    result.push({ profile, orders });
  }

  return result;
}

async function fetchUserDetailsOptimized(userIds: number[]) {
 
  return Promise.all(userIds.map(async (id)=> {
   const [profiles,orders] = await Promise.all([fetchProfile(id), 
    fetchOrders(id)]);
    return {profiles,orders}
  }));
 
}

// Retry Mechanism
async function fetchWithRetry(
  url: string,
  retries: number,
  delayMs: number
): Promise<Response> {
   let attempt = 0;
   while(attempt < retries) {
    try {
      return await fetch(url);
     
    } catch {
     attempt++;
     await new Promise((resolve) => setTimeout(resolve, delayMs));
     delayMs *= 2
     
   }}
   throw new Error;
  
  }

// N+1 Database Query Optimization.
async function getOrdersWithUsers(orderIds: number[]) {
  const result = [];

  for (const id of orderIds) {
    const order = await db.getOrder(id);        // 1 query per order
    const user = await db.getUser(order.userId); // 1 query per order
    result.push({ order, user });
  }

  return result;
}

db.getOrders(orderIds: number[]): Promise<Order[]>
db.getUsers(userIds: number[]): Promise<User[]>
interface Order {
  id : string
  total: number
  userId: number
}
interface User {
  id: number;
  name: string;
}

type OrderWithUser = Order & {user?: User}
async function getOrdersWithUsersOptimized(orderIds: number[]) : Promise<OrderWithUser[]> {
  const orders = await db.getOrders(orderIds);
  
  const userIds = orders.map((order:Order) => {
    return order.userId;
  });
  const userIdSet = new Set<number>(userIds);
  const users = await db.getUsers([...userIdSet]);
  
  const userMap = new Map<number,User>(users.map(user=>[user.id,user]));
  const result = orders.map((order:Order)=> {
    return {...order, user:userMap.get(order.userId)}

  }) 
    return result;
}

// Cursor-based pagination
async function getOrdersWithUsersPaginated(
  lastOrderId: number | null,
  limit: number
): Promise<OrderWithUser[]> {
   const orders = await db.getOrdersAfter(lastOrderId, limit);
    if (orders.length === 0) return [];
   const userIds = orders.map((order:Order) => order.userId)
   const userIdSet = new Set<number>(userIds);
   const users = await getBatchedUsers([...userIdSet]);
   const usersMap = new Map<number,User>(users.map((user:User)=>[user.id, user]));
   const result = orders.map((order:Order) => {
    return {...order, user: usersMap.get(order.userId) }
  })
   return result;
}

async function getBatchedUsers(userIds:number[]): Promise<User[]> {
 
  const size = 500;
  const users:User[] = []
  const chunkArr:number[][] = chunkArray(userIds, size);
  for(const chunk of chunkArr) {
    users.push(...await db.getUsers(chunk));
  }
  return users;
}

function chunkArray<T>(arr: T[], size: number) : T[][]{
   const chunk: T[][] = [];
   for(let i=0;i<arr.length;i+=size){
       chunk.push(arr.slice(i,i+size))
   }
   return chunk;
}

// Event Loop Blocking


app.get('/hash', (req, res) => {
  const hash = crypto.pbkdf2Sync(
    req.body.password,
    'salt',
    100000,
    64,
    'sha512'
  );
  res.send(hash);
});



