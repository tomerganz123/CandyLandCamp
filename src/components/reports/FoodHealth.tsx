'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { 
  Utensils, 
  Download, 
  Heart, 
  AlertTriangle, 
  Shield, 
  ChefHat,
  Calendar,
  Users,
  Gift,
  ShoppingCart,
  Plus,
  Minus,
  Save,
  User,
  Wrench
} from 'lucide-react';
import { IMember } from '@/models/Member';

interface FoodHealthProps {
  token: string;
}

interface HealthData {
  members: IMember[];
  dietaryData: { restriction: string; count: number; percentage: number }[];
  membersWithMedical: IMember[];
  membersWithAllergies: IMember[];
  membersWithDietary: IMember[];
  healthSummary: {
    totalMembers: number;
    withDietaryRestrictions: number;
    withMedicalConditions: number;
    withAllergies: number;
    noDietaryRestrictions: number;
  };
  dietaryCounts: Record<string, number>;
}

interface GroceryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  estimatedCost: number;
}

interface MenuItem {
  id: string;
  meal: 'breakfast' | 'dinner';
  day: number;
  dish: string;
  description: string;
  prepInstructions: string;
  servings: number;
  prepTime: number;
  ingredients: string[];
}

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

interface ShiftTask {
  id: string;
  day: number;
  shift: 'morning' | 'evening';
  task: string;
  completed: boolean;
}

interface VolunteerShift {
  id: string;
  meal: 'breakfast' | 'dinner';
  day: number | string;
  dayName?: string;
  timeSlot: string;
  volunteersNeeded: number;
  volunteersAssigned: string[];
  memberNames: string[];
}

interface KababGiftItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  estimatedCost: number;
}

interface KitchenEquipment {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  estimatedCost: number;
  priority: 'Essential' | 'Important' | 'Nice-to-Have';
  usage: string;
}

interface SetupTask {
  id: string;
  task: string;
  estimatedTime: number;
  priority: 'Critical' | 'High' | 'Medium';
  assignee?: string;
  completed: boolean;
}

interface CleanupTask {
  id: string;
  task: string;
  estimatedTime: number;
  priority: 'Critical' | 'High' | 'Medium';
  timing: 'Immediate' | 'Before Close' | 'Morning After';
  completed: boolean;
}

type KitchenTab = 'health' | 'food-supply' | 'menu-planning' | 'volunteer-shifts' | 'kabab-gift' | 'equipment-checklist';

export default function FoodHealth({ token }: FoodHealthProps) {
  const [activeTab, setActiveTab] = useState<KitchenTab>('health');
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Food Supply State
  const [groceryList, setGroceryList] = useState<GroceryItem[]>([]);
  
  // Menu Planning State
  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    // Day 1 - Arrival Day (Simple, setup-friendly meals)
    { 
      id: '1', meal: 'breakfast', day: 1, 
      dish: 'Continental Breakfast', 
      description: 'Bagels, cream cheese, fruits, coffee',
      prepInstructions: 'Set up coffee maker early. Arrange bagels and toppings on serving table. Cut fruit into bite-sized pieces.',
      servings: 60, prepTime: 15, 
      ingredients: ['Bagels', 'Cream Cheese', 'Bananas', 'Oranges', 'Coffee', 'Milk'] 
    },
    { 
      id: '2', meal: 'dinner', day: 1, 
      dish: 'Setup Welcome BBQ', 
      description: 'Hot dogs, buns, potato chips, coleslaw',
      prepInstructions: 'Prepare coleslaw 2 hours ahead. Grill hot dogs in batches. Keep warm in chafing dishes.',
      servings: 60, prepTime: 45, 
      ingredients: ['Hot Dogs', 'Hamburger Buns', 'Potato Chips', 'Cabbage', 'Mayo', 'Mustard', 'Ketchup'] 
    },
    
    // Day 2 - Full camp day
    { 
      id: '3', meal: 'breakfast', day: 2, 
      dish: 'Sunrise Fuel', 
      description: 'Pancakes, sausage links, maple syrup, fresh fruit',
      prepInstructions: 'Mix batter night before. Preheat griddles. Cook sausages in parallel. Keep pancakes warm in covered pans.',
      servings: 60, prepTime: 60, 
      ingredients: ['Pancake Mix', 'Eggs', 'Milk', 'Sausage Links', 'Maple Syrup', 'Strawberries', 'Bananas'] 
    },
    { 
      id: '4', meal: 'dinner', day: 2, 
      dish: 'Candy Land Signature', 
      description: 'Chicken shawarma, rice pilaf, hummus, pita',
      prepInstructions: 'Marinate chicken overnight. Start rice 45 min before serving. Grill chicken in batches. Warm pitas last minute.',
      servings: 60, prepTime: 90, 
      ingredients: ['Chicken Thighs', 'Rice', 'Hummus', 'Pita Bread', 'Spices', 'Yogurt', 'Lemon'] 
    },
    
    // Day 3 - Mid-camp energy day
    { 
      id: '5', meal: 'breakfast', day: 3, 
      dish: 'Energy Boost', 
      description: 'Scrambled eggs, bacon, toast, orange juice',
      prepInstructions: 'Cook bacon first, use drippings for eggs. Scramble eggs in large batches. Toast bread continuously.',
      servings: 60, prepTime: 45, 
      ingredients: ['Eggs', 'Bacon', 'Bread', 'Butter', 'Orange Juice', 'Coffee'] 
    },
    { 
      id: '6', meal: 'dinner', day: 3, 
      dish: 'Camp Classic', 
      description: 'Spaghetti with meat sauce, garlic bread, salad',
      prepInstructions: 'Make sauce 2 hours ahead. Cook pasta in batches, drain well. Broil garlic bread last 10 minutes.',
      servings: 60, prepTime: 75, 
      ingredients: ['Spaghetti', 'Ground Beef', 'Tomato Sauce', 'Garlic', 'Bread', 'Salad Mix', 'Dressing'] 
    },
    
    // Day 4 - Peak activities day
    { 
      id: '7', meal: 'breakfast', day: 4, 
      dish: 'Power Breakfast', 
      description: 'Oatmeal bar, yogurt parfaits, hard-boiled eggs',
      prepInstructions: 'Boil eggs night before. Prepare oatmeal in slow cooker. Set up parfait bar with toppings.',
      servings: 60, prepTime: 30, 
      ingredients: ['Oatmeal', 'Greek Yogurt', 'Eggs', 'Granola', 'Berries', 'Honey', 'Nuts'] 
    },
    { 
      id: '8', meal: 'dinner', day: 4, 
      dish: 'Desert Special', 
      description: 'Grilled salmon, quinoa salad, roasted vegetables',
      prepInstructions: 'Start quinoa first. Roast vegetables at 400°F. Grill salmon 4-5 min per side, don\'t overcook.',
      servings: 60, prepTime: 90, 
      ingredients: ['Salmon Fillets', 'Quinoa', 'Bell Peppers', 'Zucchini', 'Cherry Tomatoes', 'Olive Oil', 'Herbs'] 
    },
    
    // Day 5 - Farewell day (easy cleanup)
    { 
      id: '9', meal: 'breakfast', day: 5, 
      dish: 'Cleanup Friendly', 
      description: 'Breakfast burritos, coffee, leftover fruit',
      prepInstructions: 'Scramble eggs, warm tortillas. Set up burrito bar. Use up remaining fresh ingredients.',
      servings: 60, prepTime: 30, 
      ingredients: ['Tortillas', 'Eggs', 'Shredded Cheese', 'Salsa', 'Coffee', 'Bananas'] 
    },
    { 
      id: '10', meal: 'dinner', day: 5, 
      dish: 'Farewell Feast', 
      description: 'BBQ pulled pork sandwiches, chips, cookies',
      prepInstructions: 'Start slow cooker 8+ hours ahead. Shred pork before serving. Warm buns, set up sandwich station.',
      servings: 60, prepTime: 120, 
      ingredients: ['Pulled Pork', 'BBQ Sauce', 'Hamburger Buns', 'Potato Chips', 'Cookies', 'Coleslaw'] 
    },
  ]);

  // Pre-cook and Post-cook Checklists
  const [preCookChecklist, setPreCookChecklist] = useState<ChecklistItem[]>([
    { id: 'pre-1', text: 'Check propane levels for all burners', completed: false },
    { id: 'pre-2', text: 'Inspect all cooking equipment for damage', completed: false },
    { id: 'pre-3', text: 'Verify food storage temperatures', completed: false },
    { id: 'pre-4', text: 'Review dietary restrictions list', completed: false },
    { id: 'pre-5', text: 'Ensure hand-washing stations are stocked', completed: false },
    { id: 'pre-6', text: 'Check fire extinguisher accessibility', completed: false },
    { id: 'pre-7', text: 'Confirm ingredient availability for meal', completed: false },
    { id: 'pre-8', text: 'Set up serving stations and utensils', completed: false },
  ]);

  const [postCookChecklist, setPostCookChecklist] = useState<ChecklistItem[]>([
    { id: 'post-1', text: 'Store all perishables properly', completed: false },
    { id: 'post-2', text: 'Clean and sanitize all cooking surfaces', completed: false },
    { id: 'post-3', text: 'Wash all utensils and serving dishes', completed: false },
    { id: 'post-4', text: 'Dispose of trash and compost properly', completed: false },
    { id: 'post-5', text: 'Turn off all burners and equipment', completed: false },
    { id: 'post-6', text: 'Wipe down serving areas', completed: false },
    { id: 'post-7', text: 'Inventory remaining ingredients', completed: false },
    { id: 'post-8', text: 'Prep ingredients for next meal if needed', completed: false },
  ]);

  // Shift Tasks for each day
  const [shiftTasks, setShiftTasks] = useState<ShiftTask[]>([
    // Day 1
    { id: 't-1-m-1', day: 1, shift: 'morning', task: 'Unload and organize food supplies', completed: false },
    { id: 't-1-m-2', day: 1, shift: 'morning', task: 'Set up kitchen infrastructure', completed: false },
    { id: 't-1-m-3', day: 1, shift: 'morning', task: 'Prepare continental breakfast', completed: false },
    { id: 't-1-e-1', day: 1, shift: 'evening', task: 'Prep coleslaw for BBQ', completed: false },
    { id: 't-1-e-2', day: 1, shift: 'evening', task: 'Set up grill stations', completed: false },
    { id: 't-1-e-3', day: 1, shift: 'evening', task: 'Cook and serve welcome BBQ', completed: false },
    
    // Day 2
    { id: 't-2-m-1', day: 2, shift: 'morning', task: 'Prepare pancake batter from night before', completed: false },
    { id: 't-2-m-2', day: 2, shift: 'morning', task: 'Cook pancakes and sausages', completed: false },
    { id: 't-2-m-3', day: 2, shift: 'morning', task: 'Set up breakfast buffet', completed: false },
    { id: 't-2-e-1', day: 2, shift: 'evening', task: 'Marinate chicken (done night before)', completed: false },
    { id: 't-2-e-2', day: 2, shift: 'evening', task: 'Cook rice pilaf', completed: false },
    { id: 't-2-e-3', day: 2, shift: 'evening', task: 'Grill shawarma chicken', completed: false },
    
    // Day 3
    { id: 't-3-m-1', day: 3, shift: 'morning', task: 'Cook bacon in large batches', completed: false },
    { id: 't-3-m-2', day: 3, shift: 'morning', task: 'Scramble eggs continuously', completed: false },
    { id: 't-3-m-3', day: 3, shift: 'morning', task: 'Toast bread and serve', completed: false },
    { id: 't-3-e-1', day: 3, shift: 'evening', task: 'Prepare meat sauce', completed: false },
    { id: 't-3-e-2', day: 3, shift: 'evening', task: 'Cook pasta in batches', completed: false },
    { id: 't-3-e-3', day: 3, shift: 'evening', task: 'Prepare garlic bread', completed: false },
    
    // Day 4
    { id: 't-4-m-1', day: 4, shift: 'morning', task: 'Set up oatmeal bar', completed: false },
    { id: 't-4-m-2', day: 4, shift: 'morning', task: 'Prepare yogurt parfait station', completed: false },
    { id: 't-4-m-3', day: 4, shift: 'morning', task: 'Serve hard-boiled eggs', completed: false },
    { id: 't-4-e-1', day: 4, shift: 'evening', task: 'Cook quinoa', completed: false },
    { id: 't-4-e-2', day: 4, shift: 'evening', task: 'Roast vegetables', completed: false },
    { id: 't-4-e-3', day: 4, shift: 'evening', task: 'Grill salmon fillets', completed: false },
    
    // Day 5
    { id: 't-5-m-1', day: 5, shift: 'morning', task: 'Scramble eggs for burritos', completed: false },
    { id: 't-5-m-2', day: 5, shift: 'morning', task: 'Set up burrito bar', completed: false },
    { id: 't-5-m-3', day: 5, shift: 'morning', task: 'Use remaining fresh ingredients', completed: false },
    { id: 't-5-e-1', day: 5, shift: 'evening', task: 'Shred pulled pork from slow cooker', completed: false },
    { id: 't-5-e-2', day: 5, shift: 'evening', task: 'Set up sandwich station', completed: false },
    { id: 't-5-e-3', day: 5, shift: 'evening', task: 'Begin kitchen breakdown', completed: false },
  ]);

  const [activeDayTab, setActiveDayTab] = useState<number>(1);
  
  // Volunteer Shifts State
  const [volunteerShifts, setVolunteerShifts] = useState<VolunteerShift[]>([]);
  
  // Kabab Gift State
  const [kababGiftItems, setKababGiftItems] = useState<KababGiftItem[]>([]);

  // Equipment & Packing State
  const [kitchenEquipment, setKitchenEquipment] = useState<KitchenEquipment[]>([]);
  const [setupTasks, setSetupTasks] = useState<SetupTask[]>([]);
  const [cleanupTasks, setCleanupTasks] = useState<CleanupTask[]>([]);

  const fetchHealthData = async () => {
    try {
      const response = await fetch('/api/admin/reports/health', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch health data');
      }

      const result = await response.json();
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || 'Failed to load health data');
      }
    } catch (error) {
      setError('Failed to load health data');
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async (): Promise<IMember[]> => {
    try {
      const response = await fetch('/api/members', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch members');

      const result = await response.json();
      return result.success ? result.data.members : [];
    } catch (error) {
      console.error('Failed to fetch members:', error);
      return [];
    }
  };

  const initializeVolunteerShifts = async () => {
    try {
      // Fetch kitchen shift registrations from the API
      const response = await fetch('/api/kitchen-shifts?availability=true');
      const result = await response.json();
      
      if (result.success) {
        // Transform API data to VolunteerShift format
        const shifts: VolunteerShift[] = result.data.map((shift: any) => {
          const dayNames: { [key: string]: string } = {
            'Monday': 'Monday',
            'Tuesday': 'Tuesday',
            'Wednesday': 'Wednesday',
            'Thursday': 'Thursday',
            'Friday': 'Friday'
          };
          
          return {
            id: `${shift.day}-${shift.shiftTime}`,
            meal: shift.shiftTime === 'morning' ? 'breakfast' : 'dinner',
            day: shift.day,
            dayName: dayNames[shift.day] || shift.day,
            timeSlot: shift.shiftTime === 'morning' ? '7:00 AM - 10:00 AM' : '6:00 PM - 9:00 PM',
            volunteersNeeded: shift.capacity,
            volunteersAssigned: shift.registeredMembers.map((m: any) => m.name),
            memberNames: shift.registeredMembers.map((m: any) => `${m.name} (${m.role})`)
          };
        });
        
        setVolunteerShifts(shifts);
      }
    } catch (error) {
      console.error('Failed to fetch kitchen shifts:', error);
      // Fallback to empty shifts if API fails
      setVolunteerShifts([]);
    }
  };

  const initializeGroceryList = () => {
    const defaultGroceries: GroceryItem[] = [
      // PROTEINS (calculated from menu)
      { id: '1', name: 'Chicken Thighs (for shawarma)', category: 'Proteins', quantity: 35, unit: 'lbs', estimatedCost: 105 },
      { id: '2', name: 'Salmon Fillets', category: 'Proteins', quantity: 40, unit: 'lbs', estimatedCost: 240 },
      { id: '3', name: 'Eggs', category: 'Proteins', quantity: 480, unit: 'pieces', estimatedCost: 96 },
      { id: '4', name: 'Ground Beef (for meat sauce)', category: 'Proteins', quantity: 25, unit: 'lbs', estimatedCost: 100 },
      { id: '5', name: 'Hot Dogs', category: 'Proteins', quantity: 120, unit: 'pieces', estimatedCost: 48 },
      { id: '6', name: 'Bacon', category: 'Proteins', quantity: 12, unit: 'lbs', estimatedCost: 48 },
      { id: '7', name: 'Sausage Links', category: 'Proteins', quantity: 120, unit: 'pieces', estimatedCost: 36 },
      { id: '8', name: 'Pulled Pork (for bbq)', category: 'Proteins', quantity: 30, unit: 'lbs', estimatedCost: 135 },
      
      // GRAINS & BREAD (calculated from menu)
      { id: '9', name: 'Bagels (Day 1)', category: 'Grains', quantity: 120, unit: 'pieces', estimatedCost: 60 },
      { id: '10', name: 'Pita Bread (shawarma)', category: 'Grains', quantity: 80, unit: 'pieces', estimatedCost: 32 },
      { id: '11', name: 'Bread Loaves (toast)', category: 'Grains', quantity: 8, unit: 'loaves', estimatedCost: 32 },
      { id: '12', name: 'Hamburger Buns (hotdogs/bbq)', category: 'Grains', quantity: 140, unit: 'pieces', estimatedCost: 42 },
      { id: '13', name: 'Tortillas (burritos)', category: 'Grains', quantity: 120, unit: 'pieces', estimatedCost: 24 },
      { id: '14', name: 'Rice (pilaf)', category: 'Grains', quantity: 20, unit: 'lbs', estimatedCost: 30 },
      { id: '15', name: 'Quinoa', category: 'Grains', quantity: 10, unit: 'lbs', estimatedCost: 45 },
      { id: '16', name: 'Spaghetti', category: 'Grains', quantity: 12, unit: 'lbs', estimatedCost: 18 },
      { id: '17', name: 'Pancake Mix', category: 'Grains', quantity: 8, unit: 'boxes', estimatedCost: 32 },
      { id: '18', name: 'Oatmeal', category: 'Grains', quantity: 5, unit: 'lbs', estimatedCost: 15 },
      { id: '19', name: 'Garlic Bread', category: 'Grains', quantity: 60, unit: 'pieces', estimatedCost: 36 },
      
      // DAIRY & DAIRY PRODUCTS (calculated from menu)
      { id: '20', name: 'Cream Cheese (bagels)', category: 'Dairy', quantity: 8, unit: '8-oz packages', estimatedCost: 24 },
      { id: '21', name: 'Milk', category: 'Dairy', quantity: 12, unit: 'gallons', estimatedCost: 36 },
      { id: '22', name: 'Greek Yogurt (parfaits)', category: 'Dairy', quantity: 60, unit: 'containers', estimatedCost: 90 },
      { id: '23', name: 'Shredded Cheese (burritos)', category: 'Dairy', quantity: 6, unit: 'lbs', estimatedCost: 54 },
      
      // VEGETABLES (calculated from menu)
      { id: '24', name: 'Bell Peppers (quinoa salad)', category: 'Vegetables', quantity: 24, unit: 'pieces', estimatedCost: 48 },
      { id: '25', name: 'Zucchini (roasted)', category: 'Vegetables', quantity: 20, unit: 'pieces', estimatedCost: 40 },
      { id: '26', name: 'Cherry Tomatoes', category: 'Vegetables', quantity: 15, unit: 'lbs', estimatedCost: 45 },
      { id: '27', name: 'Cabbage (coleslaw)', category: 'Vegetables', quantity: 4, unit: 'heads', estimatedCost: 12 },
      { id: '28', name: 'Salad Mix', category: 'Vegetables', quantity: 8, unit: 'bags', estimatedCost: 32 },
      
      // FRUITS (calculated from menu)
      { id: '29', name: 'Bananas (multiday)', category: 'Fruits', quantity: 120, unit: 'pieces', estimatedCost: 36 },
      { id: '30', name: 'Oranges (breakfast)', category: 'Fruits', quantity: 60, unit: 'pieces', estimatedCost: 30 },
      { id: '31', name: 'Strawberries', category: 'Fruits', quantity: 12, unit: 'containers', estimatedCost: 84 },
      { id: '32', name: 'Mixed Berries (parfaits)', category: 'Fruits', quantity: 8, unit: 'bags', estimatedCost: 56 },
      
      // CONDIMENTS & SAUCES
      { id: '33', name: 'Hummus', category: 'Condiments', quantity: 8, unit: 'containers', estimatedCost: 40 },
      { id: '34', name: 'BBQ Sauce', category: 'Condiments', quantity: 6, unit: 'bottles', estimatedCost: 30 },
      { id: '35', name: 'Tomato Sauce (spaghetti)', category: 'Condiments', quantity: 8, unit: 'jars', estimatedCost: 32 },
      { id: '36', name: 'Maple Syrup', category: 'Condiments', quantity: 2, unit: 'bottles', estimatedCost: 16 },
      { id: '37', name: 'Honey (oatmeal)', category: 'Condiments', quantity: 2, unit: 'bottles', estimatedCost: 20 },
      { id: '38', name: 'Mayo (coleslaw)', category: 'Condiments', quantity: 4, unit: 'jars', estimatedCost: 24 },
      { id: '39', name: 'Mustard', category: 'Condiments', quantity: 3, unit: 'bottles', estimatedCost: 9 },
      { id: '40', name: 'Ketchup', category: 'Condiments', quantity: 3, unit: 'bottles', estimatedCost: 9 },
      { id: '41', name: 'Salsa (burritos)', category: 'Condiments', quantity: 4, unit: 'jars', estimatedCost: 16 },
      { id: '42', name: 'Salad Dressing', category: 'Condiments', quantity: 6, unit: 'bottles', estimatedCost: 36 },
      
      // DRY GOODS & SPICES
      { id: '43', name: 'Spices Mix (shawarma)', category: 'Spices', quantity: 0.5, unit: 'lbs', estimatedCost: 15 },
      { id: '44', name: 'Garlic', category: 'Spices', quantity: 1, unit: 'lbs', estimatedCost: 8 },
      { id: '45', name: 'Olive Oil', category: 'Spices', quantity: 3, unit: 'bottles', estimatedCost: 45 },
      { id: '46', name: 'Lemon Juice', category: 'Spices', quantity: 3, unit: 'bottles', estimatedCost: 18 },
      { id: '47', name: 'Granola', category: 'Dry Goods', quantity: 4, unit: 'lbs', estimatedCost: 32 },
      { id: '48', name: 'Mixed Nuts', category: 'Dry Goods', quantity: 3, unit: 'lbs', estimatedCost: 45 },
      { id: '49', name: 'Butter', category: 'Dry Goods', quantity: 8, unit: 'lbs', estimatedCost: 32 },
      { id: '50', name: 'Salt & Pepper', category: 'Spices', quantity: 2, unit: 'sets', estimatedCost: 8 },
      
      // SNACKS & EXTRAS
      { id: '51', name: 'Potato Chips (multiday)', category: 'Snacks', quantity: 20, unit: 'bags', estimatedCost: 80 },
      { id: '52', name: 'Coleslaw Mix (premade)', category: 'Snacks', quantity: 8, unit: 'bags', estimatedCost: 32 },
      { id: '53', name: 'Cookies (dessert)', category: 'Snacks', quantity: 10, unit: 'boxes', estimatedCost: 50 },
      
      // BEVERAGES
      { id: '54', name: 'Water Bottles', category: 'Beverages', quantity: 180, unit: 'packs', estimatedCost: 180 },
      { id: '55', name: 'Coffee (ground)', category: 'Beverages', quantity: 8, unit: 'lbs', estimatedCost: 80 },
      { id: '56', name: 'Orange Juice', category: 'Beverages', quantity: 12, unit: 'cartons', estimatedCost: 48 },
      { id: '57', name: 'Tea Bags', category: 'Beverages', quantity: 8, unit: 'boxes', estimatedCost: 32 },
    ];
    
    setGroceryList(defaultGroceries);
  };

  const initializeKababGift = () => {
    const giftItems: KababGiftItem[] = [
      { id: '1', name: 'Pita Bread', quantity: 300, unit: 'pieces', estimatedCost: 90 },
      { id: '2', name: 'Chicken Shawarma Meat', quantity: 50, unit: 'lbs', estimatedCost: 150 },
      { id: '3', name: 'Tahini Sauce', quantity: 20, unit: 'lbs', estimatedCost: 60 },
      { id: '4', name: 'Pickled Vegetables', quantity: 30, unit: 'lbs', estimatedCost: 45 },
      { id: '5', name: 'Hot Sauce', quantity: 500, unit: 'oz', estimatedCost: 50 },
      { id: '6', name: 'Napkins', quantity: 300, unit: 'packages', estimatedCost: 30 },
      { id: '7', name: 'Small Plates', quantity: 300, unit: 'pieces', estimatedCost: 60 },
    ];
    
    setKababGiftItems(giftItems);
  };

  const initializeKitchenEquipment = () => {
    const equipment: KitchenEquipment[] = [
      // COOKING EQUIPMENT - ESSENTIAL
      { id: '1', name: 'Propane Burners (20in)', category: 'Cooking Equipment', quantity: 3, unit: 'pieces', estimatedCost: 240, priority: 'Essential', usage: 'All meals - primary cooking surface' },
      { id: '2', name: 'Propane Tanks (20lb)', category: 'Cooking Equipment', quantity: 8, unit: 'pieces', estimatedCost: 320, priority: 'Essential', usage: 'Fuel for burners' },
      { id: '3', name: 'Cast Iron Griddle (20x30)', category: 'Cooking Equipment', quantity: 2, unit: 'pieces', estimatedCost: 200, priority: 'Essential', usage: 'Pancakes, eggs, bacon' },
      { id: '4', name: 'Large Stock Pots (20 quart)', category: 'Cooking Equipment', quantity: 4, unit: 'pieces', estimatedCost: 160, priority: 'Essential', usage: 'Rice, pasta, cooking large quantities' },
      { id: '5', name: 'Dutch Oven (12 quart)', category: 'Cooking Equipment', quantity: 3, unit: 'pieces', estimatedCost: 225, priority: 'Essential', usage: 'Slow cooking, BBQ pork' },
      { id: '6', name: 'Large Skillets (14 inch)', category: 'Cooking Equipment', quantity: 4, unit: 'pieces', estimatedCost: 120, priority: 'Essential', usage: 'Chicken shawarma, eggs' },
      
      // SERVING EQUIPMENT - ESSENTIAL
      { id: '7', name: 'Chafing Dishes + Stands', category: 'Serving Equipment', quantity: 12, unit: 'sets', estimatedCost: 360, priority: 'Essential', usage: 'Keep food warm during service' },
      { id: '8', name: 'Large Serving Bowls (metal)', category: 'Serving Equipment', quantity: 20, unit: 'pieces', estimatedCost: 200, priority: 'Essential', usage: 'Food storage and serving' },
      { id: '9', name: 'Large Mixing Bowls (stainless)', category: 'Serving Equipment', quantity: 15, unit: 'pieces', estimatedCost: 225, priority: 'Essential', usage: 'Prep work, mixing ingredients' },
      { id: '10', name: 'Cutting Boards (color coded)', category: 'Serving Equipment', quantity: 8, unit: 'sets', estimatedCost: 80, priority: 'Essential', usage: 'Safe food prep' },
      { id: '11', name: 'Service Utensils Set', category: 'Serving Equipment', quantity: 3, unit: 'sets', estimatedCost: 60, priority: 'Essential', usage: 'Serving spoons, spatulas, tongs' },
      
      // STORAGE & COOLING - ESSENTIAL
      { id: '12', name: 'Coolers (75 quart)', category: 'Storage Equipment', quantity: 4, unit: 'pieces', estimatedCost: 320, priority: 'Essential', usage: 'Food cooling and storage' },
      { id: '13', name: 'Ice Chests (120 quart)', category: 'Storage Equipment', quantity: 2, unit: 'pieces', estimatedCost: 200, priority: 'Essential', usage: 'Beverage cooling' },
      { id: '14', name: 'Dry Storage Bins', category: 'Storage Equipment', quantity: 8, unit: 'pieces', estimatedCost: 120, priority: 'Essential', usage: 'Dry goods organization' },
      { id: '15', name: 'Metal Shelving Unit', category: 'Storage Equipment', quantity: 2, unit: 'pieces', estimatedCost: 160, priority: 'Essential', usage: 'Food organization' },
      
      // PREP EQUIPMENT - IMPORTANT
      { id: '16', name: 'Industrial Food Processor', category: 'Prep Equipment', quantity: 1, unit: 'piece', estimatedCost: 150, priority: 'Important', usage: 'Hummus, coleslaw prep' },
      { id: '17', name: 'Large Knife Set', category: 'Prep Equipment', quantity: 3, unit: 'sets', estimatedCost: 150, priority: 'Important', usage: 'All cutting tasks' },
      { id: '18', name: 'Measuring Cups/Spoons', category: 'Prep Equipment', quantity: 3, unit: 'sets', estimatedCost: 45, priority: 'Important', usage: 'Precise ingredient measuring' },
      
      // COFFEE & BEVERAGE - IMPORTANT
      { id: '19', name: 'Coffee Percolator (40 cup)', category: 'Beverage Equipment', quantity: 2, unit: 'pieces', estimatedCost: 120, priority: 'Important', usage: 'Coffee service' },
      { id: '20', name: 'Water Dispensers', category: 'Beverage Equipment', quantity: 3, unit: 'pieces', estimatedCost: 150, priority: 'Important', usage: 'Hydration station' },
      
      // SAFETY & CLEANUP - ESSENTIAL
      { id: '21', name: 'Fire Extinguishers', category: 'Safety Equipment', quantity: 2, unit: 'pieces', estimatedCost: 80, priority: 'Essential', usage: 'Emergency safety' },
      { id: '22', name: 'First Aid Kit (Large)', category: 'Safety Equipment', quantity: 2, unit: 'pieces', estimatedCost: 60, priority: 'Essential', usage: 'Kitchen injuries' },
      { id: '23', name: 'Hand Washing Station', category: 'Safety Equipment', quantity: 1, unit: 'piece', estimatedCost: 100, priority: 'Essential', usage: 'Food safety compliance' },
      { id: '24', name: 'Dishwashing Station Setup', category: 'Cleanup Equipment', quantity: 1, unit: 'piece', estimatedCost: 200, priority: 'Essential', usage: 'Plate/cup cleaning' },
      { id: '25', name: 'Large Trash Cans', category: 'Cleanup Equipment', quantity: 6, unit: 'pieces', estimatedCost: 180, priority: 'Essential', usage: 'Waste management' },
      
      // LIGHTING & POWER - IMPORTANT
      { id: '26', name: 'LED Work Lights', category: 'Utility Equipment', quantity: 4, unit: 'pieces', estimatedCost: 120, priority: 'Important', usage: 'Evening cooking/prep' },
      { id: '27', name: 'Extension Cords (heavy duty)', category: 'Utility Equipment', quantity: 6, unit: 'pieces', estimatedCost: 90, priority: 'Important', usage: 'Power distribution' },
    ];
    
    setKitchenEquipment(equipment);
  };

  const initializeSetupTasks = () => {
    const tasks: SetupTask[] = [
      { id: '1', task: 'UnLoad truck and organize equipment', estimatedTime: 60, priority: 'Critical', completed: false },
      { id: '2', task: 'Set up propane burners and test ignition', estimatedTime: 30, priority: 'Critical', completed: false },
      { id: '3', task: 'Install chafing dish stands and fuel', estimatedTime: 15, priority: 'High', completed: false },
      { id: '4', task: 'Set up dry storage area with shelving', estimatedTime: 20, priority: 'High', completed: false },
      { id: '5', task: 'Position coolers and add ice', estimatedTime: 30, priority: 'High', completed: false },
      { id: '6', task: 'Set up hand washing station', estimatedTime: 10, priority: 'Critical', completed: false },
      { id: '7', task: 'Install dishwashing station', estimatedTime: 45, priority: 'High', completed: false },
      { id: '8', task: 'Set up coffee stations', estimatedTime: 15, priority: 'Medium', completed: false },
      { id: '9', task: 'Distribute cutting boards and sanitize', estimatedTime: 10, priority: 'High', completed: false },
      { id: '10', task: 'Install work lighting', estimatedTime: 20, priority: 'Medium', completed: false },
    ];
    
    setSetupTasks(tasks);
  };

  const initializeCleanupTasks = () => {
    const tasks: CleanupTask[] = [
      // Immediate cleanup (after each meal)
      { id: '1', task: 'Scrape and sanitize griddles/cookware', estimatedTime: 15, priority: 'Critical', timing: 'Immediate', completed: false },
      { id: '2', task: 'Dispose food waste and empty chafing dishes', estimatedTime: 10, priority: 'Critical', timing: 'Immediate', completed: false },
      { id: '3', task: 'Rinse serving utensils in hot water', estimatedTime: 5, priority: 'High', timing: 'Immediate', completed: false },
      
      // Before close cleanup (end of day)
      { id: '4', task: 'Deep clean all cooking equipment', estimatedTime: 45, priority: 'Critical', timing: 'Before Close', completed: false },
      { id: '5', task: 'Wash and sanitize all utensils/prep equipment', estimatedTime: 30, priority: 'High', timing: 'Before Close', completed: false },
      { id: '6', task: 'Organize and restock dry goods', estimatedTime: 20, priority: 'Medium', timing: 'Before Close', completed: false },
      { id: '7', task: 'Clean and reorganize cooler contents', estimatedTime: 25, priority: 'Medium', timing: 'Before Close', completed: false },
      { id: '8', task: 'Secure and cover equipment for wind/dust', estimatedTime: 15, priority: 'Medium', timing: 'Before Close', completed: false },
      
      // Morning after cleanup (final day)
      { id: '9', task: 'Break down propane burners and fuel tanks', estimatedTime: 30, priority: 'Critical', timing: 'Morning After', completed: false },
      { id: '10', task: 'Dispose of all food waste and cleaning chemicals', estimatedTime: 20, priority: 'High', timing: 'Morning After', completed: false },
      { id: '11', task: 'Pack and organize all equipment for transport', estimatedTime: 60, priority: 'Critical', timing: 'Morning After', completed: false },
      { id: '12', task: 'Final sanitation of all food contact surfaces', estimatedTime: 25, priority: 'High', timing: 'Morning After', completed: false },
    ];
    
    setCleanupTasks(tasks);
  };

  const addGroceryItem = () => {
    const newItem: GroceryItem = {
      id: Date.now().toString(),
      name: '',
      category: 'Other',
      quantity: 1,
      unit: 'piece',
      estimatedCost: 0
    };
    setGroceryList([...groceryList, newItem]);
  };

  const updateGroceryItem = (id: string, field: keyof GroceryItem, value: any) => {
    setGroceryList(groceryList.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const deleteGroceryItem = (id: string) => {
    setGroceryList(groceryList.filter(item => item.id !== id));
  };

  const exportKitchenData = async () => {
    // Export logic for kitchen management data
    const csvContent = [
      '# Kitchen Management Export',
      '# Generated on: ' + new Date().toLocaleString(),
      '',
      '# Grocery List',
      'Item,Category,Quantity,Unit,Estimated Cost',
      ...groceryList.map(item => `${item.name},${item.category},${item.quantity},${item.unit},${item.estimatedCost}`),
      '',
      '# Total Estimated Cost: $' + groceryList.reduce((sum, item) => sum + item.estimatedCost, 0),
      '',
      '# Menu Planning',
      'Day,Meal,Dish,Servings,Prep Time (min)',
      ...menuItems.map(item => `${item.day},${item.meal},${item.dish},${item.servings},${item.prepTime}`),
      '',
      '# Volunteer Shifts Coverage',
      'Day,Meal,Volunteers Needed,Volunteers Assigned,Coverage %',
      ...volunteerShifts.map(shift => `${shift.day},${shift.meal},${shift.volunteersNeeded},${shift.volunteersAssigned.length},${Math.round((shift.volunteersAssigned.length / shift.volunteersNeeded) * 100)}`),
      '',
      '# Kabab Gift Items',
      'Item,Quantity,Unit,Estimated Cost',
      ...kababGiftItems.map(item => `${item.name},${item.quantity},${item.unit},${item.estimatedCost}`),
      '',
      '# Kabab Gift Total: $' + kababGiftItems.reduce((sum, item) => sum + item.estimatedCost, 0)
    ];
    
    const blob = new Blob([csvContent.join('\n')], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
    a.download = `baba-zman-kitchen-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
  };

  const updateSetupTask = (id: string, completed: boolean) => {
    setSetupTasks(setupTasks.map(task => 
      task.id === id ? { ...task, completed } : task
    ));
  };

  const updateCleanupTask = (id: string, completed: boolean) => {
    setCleanupTasks(cleanupTasks.map(task => 
      task.id === id ? { ...task, completed } : task
    ));
  };

  useEffect(() => {
    fetchHealthData();
    initializeGroceryList();
    initializeVolunteerShifts();
    initializeKababGift();
    initializeKitchenEquipment();
    initializeSetupTasks();
    initializeCleanupTasks();
  }, [token]);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="spinner h-8 w-8 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading kitchen management data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={fetchHealthData}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'health', label: 'Health Overview', icon: Heart },
    { id: 'food-supply', label: 'Food Supply Order', icon: ShoppingCart },
    { id: 'menu-planning', label: 'Menu Planning', icon: Calendar },
    { id: 'volunteer-shifts', label: 'Volunteer Shifts', icon: Users },
    { id: 'kabab-gift', label: 'Kabab Hazman Gift', icon: Gift },
    { id: 'equipment-checklist', label: 'Equipment & Setup', icon: Wrench },
  ];

  const totalGroceryCost = groceryList.reduce((sum, item) => sum + item.estimatedCost, 0);
  const totalKababCost = kababGiftItems.reduce((sum, item) => sum + item.estimatedCost, 0);
  const totalEquipmentCost = kitchenEquipment.reduce((sum, item) => sum + item.estimatedCost, 0);
  const totalKitchenCost = totalGroceryCost + totalKababCost + totalEquipmentCost;

  const renderHealthOverview = () => {
  if (!data) return null;

  return (
      <div>
      {/* Health Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-cf-green-50 rounded-lg p-6 border border-green-200">
          <div className="flex items-center">
            <Utensils className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-green-600">Dietary Restrictions</p>
              <p className="text-2xl font-semibold text-green-900">{data.healthSummary.withDietaryRestrictions}</p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 rounded-lg p-6 border border-red-200">
          <div className="flex items-center">
            <Heart className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-red-600">Medical Conditions</p>
              <p className="text-2xl font-semibold text-red-900">{data.healthSummary.withMedicalConditions}</p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-yellow-600">Allergies</p>
              <p className="text-2xl font-semibold text-yellow-900">{data.healthSummary.withAllergies}</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-600">No Restrictions</p>
              <p className="text-2xl font-semibold text-blue-900">{data.healthSummary.noDietaryRestrictions}</p>
            </div>
          </div>
        </div>
      </div>

        {/* Dietary Collections Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Dietary Restrictions Summary</h3>
        <ResponsiveContainer width="100%" height={300}>
          <RechartsBarChart data={data.dietaryData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="restriction" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#ef4444" />
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>

      {/* Health Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Medical Conditions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Medical Conditions ({data.membersWithMedical.length})
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {data.membersWithMedical.length > 0 ? (
              data.membersWithMedical.map((member) => (
                  <div key={`${member._id as string}medical`} className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="font-medium text-gray-900">{member.firstName} {member.lastName}</div>
                  <div className="text-sm text-gray-600">{member.phone}</div>
                  <div className="text-sm text-red-800 mt-1 font-medium">{member.medicalConditions}</div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No medical conditions reported</p>
            )}
          </div>
        </div>

        {/* Allergies */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Allergies ({data.membersWithAllergies.length})
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {data.membersWithAllergies.length > 0 ? (
              data.membersWithAllergies.map((member) => (
                  <div key={`${member._id as string}allergy`} className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="font-medium text-gray-900">{member.firstName} {member.lastName}</div>
                  <div className="text-sm text-gray-600">{member.phone}</div>
                  <div className="text-sm text-yellow-800 mt-1 font-medium">{member.allergies}</div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No allergies reported</p>
            )}
        </div>
      </div>

      {/* Dietary Restrictions Details */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Dietary Restrictions Breakdown</h3>
            <div className="space-y-2">
          {data.dietaryData.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-green-50 rounded border">
                <span className="font-medium text-gray-900">{item.restriction}</span>
                  <div>
                    <span className="font-semibold text-green-900">{item.count}</span>
                  <span className="text-sm text-gray-500 ml-2">({item.percentage}%)</span>
                </div>
                </div>
              ))}
              
              {data.dietaryData.length === 0 && (
                <p className="text-gray-500 text-center py-4">No dietary restrictions reported</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderFoodSupply = () => (
    <div>
      {/* Food Supply Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Food Supply Order Summary</h3>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">${totalGroceryCost}</div>
            <div className="text-sm text-gray-500">Total Estimated Cost</div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded">
            <div className="font-semibold text-gray-900">{groceryList.length}</div>
            <div className="text-sm text-gray-500">Items</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded">
            <div className="font-semibold text-gray-900">60</div>
            <div className="text-sm text-gray-500">People</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded">
            <div className="font-semibold text-gray-900">5</div>
            <div className="text-sm text-gray-500">Days</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded">
            <div className="font-semibold text-gray-900">10</div>
            <div className="text-sm text-gray-500">Meals</div>
          </div>
        </div>
      </div>

      {/* Grocery Categories */}
      {['Proteins', 'Grains', 'Dairy', 'Vegetables', 'Fruits', 'Condiments', 'Spices', 'Dry Goods', 'Snacks', 'Beverages', 'Other'].map(category => {
        const categoryItems = groceryList.filter(item => item.category === category);
        const categoryCost = categoryItems.reduce((sum, item) => sum + item.estimatedCost, 0);
        
        return (
          <div key={category} className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold text-gray-800">{category}</h4>
              <div className="text-right">
                <div className="font-semibold text-gray-900">{categoryItems.length} items</div>
                <div className="text-sm text-gray-500">${categoryCost}</div>
              </div>
            </div>
            <div className="space-y-2">
              {categoryItems.map(item => (
                <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded border">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => updateGroceryItem(item.id, 'name', e.target.value)}
                    className="flex-1 px-2 py-1 border rounded"
                    placeholder="Item name"
                  />
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateGroceryItem(item.id, 'quantity', Number(e.target.value))}
                    className="w-20 px-2 py-1 border rounded"
                    min="0"
                  />
                  <input
                    type="text"
                    value={item.unit}
                    onChange={(e) => updateGroceryItem(item.id, 'unit', e.target.value)}
                    className="w-20 px-2 py-1 border rounded"
                    placeholder="unit"
                  />
                  <span className="text-sm text-gray-500">×</span>
                  <span className="text-gray-900">${item.estimatedCost}</span>
                  <button
                    onClick={() => deleteGroceryItem(item.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <button
        onClick={addGroceryItem}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
      >
        <Plus className="h-4 w-4" />
        Add New Item
      </button>
    </div>
  );

  const handleChecklistToggle = (type: 'pre' | 'post', id: string) => {
    if (type === 'pre') {
      setPreCookChecklist(prev => 
        prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item)
      );
    } else {
      setPostCookChecklist(prev => 
        prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item)
      );
    }
  };

  const handleShiftTaskToggle = (id: string) => {
    setShiftTasks(prev => 
      prev.map(task => task.id === id ? { ...task, completed: !task.completed } : task)
    );
  };

  const handleMenuItemUpdate = (id: string, field: keyof MenuItem, value: string | string[]) => {
    setMenuItems(prev => 
      prev.map(item => item.id === id ? { ...item, [field]: value } : item)
    );
  };

  const renderMenuPlanning = () => {
    const dayMeals = menuItems.filter(item => item.day === activeDayTab);
    const dayTasks = shiftTasks.filter(task => task.day === activeDayTab);
    const morningTasks = dayTasks.filter(task => task.shift === 'morning');
    const eveningTasks = dayTasks.filter(task => task.shift === 'evening');

    return (
      <div>
        {/* Checklists Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Pre-Cook Checklist */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
              <ChefHat className="h-5 w-5" />
              Pre-Cook Checklist
            </h3>
            <div className="space-y-2">
              {preCookChecklist.map(item => (
                <label key={item.id} className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => handleChecklistToggle('pre', item.id)}
                    className="mt-0.5 h-4 w-4 text-green-600 rounded focus:ring-green-500"
                  />
                  <span className={`text-sm ${item.completed ? 'text-green-600 line-through' : 'text-green-800'} group-hover:text-green-900`}>
                    {item.text}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Post-Cook Checklist */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Post-Cook Checklist
            </h3>
            <div className="space-y-2">
              {postCookChecklist.map(item => (
                <label key={item.id} className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => handleChecklistToggle('post', item.id)}
                    className="mt-0.5 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className={`text-sm ${item.completed ? 'text-blue-600 line-through' : 'text-blue-800'} group-hover:text-blue-900`}>
                    {item.text}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Day Tabs */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex flex-wrap gap-2 mb-6 border-b pb-4">
            {[1, 2, 3, 4, 5].map(day => (
              <button
                key={day}
                onClick={() => setActiveDayTab(day)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeDayTab === day
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Day {day}
              </button>
            ))}
          </div>

          {/* Meals for Selected Day */}
          <div className="space-y-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Utensils className="h-5 w-5" />
              Day {activeDayTab} Menu
            </h3>
            
            {dayMeals.map(item => (
              <div key={item.id} className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-lg font-semibold capitalize text-gray-900">
                    {item.meal}
                  </h4>
                  <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border">
                    {item.prepTime} min prep
                  </span>
                </div>

                {/* Section 1: Meal Title and Description */}
                <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
                  <h5 className="text-sm font-semibold text-gray-700 mb-3">Meal Details</h5>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Meal Title
                      </label>
                      <input
                        type="text"
                        value={item.dish}
                        onChange={(e) => handleMenuItemUpdate(item.id, 'dish', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Description
                      </label>
                      <textarea
                        value={item.description}
                        onChange={(e) => handleMenuItemUpdate(item.id, 'description', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Prep Instructions */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h5 className="text-sm font-semibold text-gray-700 mb-3">Prep Instructions</h5>
                  <textarea
                    value={item.prepInstructions}
                    onChange={(e) => handleMenuItemUpdate(item.id, 'prepInstructions', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                    placeholder="Enter detailed preparation instructions..."
                  />
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
                  <strong>Servings:</strong> {item.servings} | <strong>Ingredients:</strong> {item.ingredients.join(', ')}
                </div>
              </div>
            ))}
          </div>

          {/* Shift Tasks */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Day {activeDayTab} Shift Tasks
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Morning Shift */}
              <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-5">
                <h4 className="font-semibold text-yellow-900 mb-4 flex items-center gap-2">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                  Morning Shift
                </h4>
                <div className="space-y-2">
                  {morningTasks.map(task => (
                    <label key={task.id} className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => handleShiftTaskToggle(task.id)}
                        className="mt-0.5 h-4 w-4 text-yellow-600 rounded focus:ring-yellow-500"
                      />
                      <span className={`text-sm ${task.completed ? 'text-yellow-600 line-through' : 'text-yellow-900'} group-hover:text-yellow-700`}>
                        {task.task}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Evening Shift */}
              <div className="bg-purple-50 rounded-lg border border-purple-200 p-5">
                <h4 className="font-semibold text-purple-900 mb-4 flex items-center gap-2">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                  Evening Shift
                </h4>
                <div className="space-y-2">
                  {eveningTasks.map(task => (
                    <label key={task.id} className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => handleShiftTaskToggle(task.id)}
                        className="mt-0.5 h-4 w-4 text-purple-600 rounded focus:ring-purple-500"
                      />
                      <span className={`text-sm ${task.completed ? 'text-purple-600 line-through' : 'text-purple-900'} group-hover:text-purple-700`}>
                        {task.task}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderVolunteerShifts = () => (
    <div>
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Volunteer Kitchen Shifts</h3>
          <div className="text-sm text-gray-500">
            Target: 1 shift per member during the week | Morning: 5 volunteers | Evening: 6 volunteers
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-blue-800">Shift Requirements</span>
          </div>
          <div className="text-sm text-blue-700 space-y-1">
            <p>• Morning shifts (7:00 AM - 10:00 AM): <strong>5 volunteers</strong> including 1 shift manager</p>
            <p>• Evening shifts (6:00 PM - 9:00 PM): <strong>6 volunteers</strong> including 1 shift manager</p>
            <p>• Each shift must have a manager assigned before volunteers can register</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {volunteerShifts.map(shift => {
            const displayDay = shift.dayName || `Day ${shift.day}`;
            const shiftLabel = shift.meal === 'breakfast' ? 'Morning' : 'Evening';
            
            return (
              <div key={shift.id} className="p-4 bg-gray-50 rounded border">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">{displayDay} - {shiftLabel}</h4>
                    <div className="text-sm text-gray-500">{shift.timeSlot}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900">
                      {shift.volunteersAssigned.length}/{shift.volunteersNeeded}
                    </div>
                    <div className="text-xs text-gray-500">volunteers</div>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div 
                    className={`h-2 rounded-full ${
                      shift.volunteersAssigned.length >= shift.volunteersNeeded 
                        ? 'bg-green-600' 
                        : shift.volunteersAssigned.length > 0 
                          ? 'bg-yellow-500' 
                          : 'bg-red-400'
                    }`}
                    style={{ width: `${Math.min((shift.volunteersAssigned.length / shift.volunteersNeeded) * 100, 100)}%` }}
                  ></div>
                </div>
                
                <div className="text-sm text-gray-600">
                  {shift.volunteersAssigned.length > 0 ? (
                    <div>
                      <strong>Assigned:</strong>
                      <div className="mt-1 space-y-1">
                        {shift.memberNames.map((name, idx) => (
                          <div key={idx} className="text-xs">• {name}</div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-red-600 font-medium">⚠️ Need volunteers</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {volunteerShifts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No kitchen shift data available yet.</p>
            <p className="text-sm mt-2">Members can register for shifts at the Kitchen Shifts page.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderKababGift = () => (
    <div>
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Kabab Hazman Gift</h3>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">${totalKababCost}</div>
            <div className="text-sm text-gray-500">Total Estimated Cost</div>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Gift className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-blue-800">Playa Kitchen Gift</span>
          </div>
          <div className="text-blue-700">
            Plan to feed approximately 250 people around the playa with small bites
          </div>
        </div>

        <div className="space-y-4">
          {kababGiftItems.map(item => (
            <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded border">
              <div className="flex-1">
                <div className="font-medium text-gray-900">{item.name}</div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="font-semibold text-gray-900">{item.quantity}</div>
                  <div className="text-xs text-gray-500">{item.unit}</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-900">${item.estimatedCost}</div>
                  <div className="text-xs text-gray-500">estimated</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderEquipmentChecklist = () => {
    const essentialEquipment = kitchenEquipment.filter(item => item.priority === 'Essential');
    const importantEquipment = kitchenEquipment.filter(item => item.priority === 'Important');
    const niceToHaveEquipment = kitchenEquipment.filter(item => item.priority === 'Nice-to-Have');

    const setupCriticalTasks = setupTasks.filter(task => task.priority === 'Critical');
    const setupHighTasks = setupTasks.filter(task => task.priority === 'High');
    const setupMediumTasks = setupTasks.filter(task => task.priority === 'Medium');

    const immediateCleanup = cleanupTasks.filter(task => task.timing === 'Immediate');
    const beforeCloseCleanup = cleanupTasks.filter(task => task.timing === 'Before Close');
    const morningAfterCleanup = cleanupTasks.filter(task => task.timing === 'Morning After');

    return (
      <div>
        {/* Equipment Summary */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Equipment Summary</h3>
            <div className="text-right">
              <div className="text-2xl font-bold text-orange-600">${totalEquipmentCost}</div>
              <div className="text-sm text-gray-500">Total Equipment Cost</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-red-50 rounded">
              <div className="font-semibold text-red-900">{essentialEquipment.length}</div>
              <div className="text-sm text-red-600">Essential Items</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded">
              <div className="font-semibold text-yellow-900">{importantEquipment.length}</div>
              <div className="text-sm text-yellow-600">Important Items</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded">
              <div className="font-semibold text-gray-900">{niceToHaveEquipment.length}</div>
              <div className="text-sm text-gray-600">Nice-to-Have</div>
            </div>
          </div>
        </div>

        {/* Equipment by Priority */}
        {['Essential', 'Important', 'Nice-to-Have'].map(priority => {
          const items = kitchenEquipment.filter(item => item.priority === priority);
          const priorityCost = items.reduce((sum, item) => sum + item.estimatedCost, 0);
          
          return (
            <div key={priority} className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-gray-800">{priority} Equipment ({items.length})</h4>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">${priorityCost}</div>
                  <div className="text-sm text-gray-500">estimated cost</div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map(item => (
                  <div key={item.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-medium text-gray-900">{item.name}</h5>
                      <span className="text-sm text-gray-500">${item.estimatedCost}</span>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">{item.quantity} {item.unit}</div>
                    <div className="text-xs text-gray-500">{item.usage}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Setup Checklist */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Setup Checklist
          </h3>
          <p className="text-sm text-green-700 mb-4">
            Complete these tasks before cooking begins. Estimated total time: {setupTasks.reduce((sum, task) => sum + task.estimatedTime, 0)} minutes
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Critical Setup Tasks */}
            <div>
              <h4 className="font-semibold text-red-800 mb-3">Critical Priority</h4>
              {setupCriticalTasks.map(task => (
                <div key={task.id} className="flex items-center gap-3 mb-2">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={(e) => updateSetupTask(task.id, e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <div className="flex-1">
                    <span className="text-sm text-green-800">{task.task}</span>
                    <span className="text-xs text-green-600 ml-2">({task.estimatedTime} min)</span>
                  </div>
                </div>
              ))}
            </div>

            {/* High Priority Tasks */}
            <div>
              <h4 className="font-semibold text-yellow-800 mb-3">High Priority</h4>
              {setupHighTasks.map(task => (
                <div key={task.id} className="flex items-center gap-3 mb-2">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={(e) => updateSetupTask(task.id, e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <div className="flex-1">
                    <span className="text-sm text-green-800">{task.task}</span>
                    <span className="text-xs text-green-600 ml-2">({task.estimatedTime} min)</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Medium Priority Tasks */}
            <div>
              <h4 className="font-semibold text-blue-800 mb-3">Medium Priority</h4>
              {setupMediumTasks.map(task => (
                <div key={task.id} className="flex items-center gap-3 mb-2">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={(e) => updateSetupTask(task.id, e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <div className="flex-1">
                    <span className="text-sm text-green-800">{task.task}</span>
                    <span className="text-xs text-green-600 ml-2">({task.estimatedTime} min)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cleanup Schedule */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Cleanup Schedule
          </h3>
          <p className="text-sm text-red-700 mb-4">
            Follow this cleanup schedule to maintain food safety and efficient operations
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Immediate Cleanup */}
            <div>
              <h4 className="font-semibold text-red-800 mb-3">Immediate (After Each Meal)</h4>
              {immediateCleanup.map(task => (
                <div key={task.id} className="flex items-center gap-3 mb-2">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={(e) => updateCleanupTask(task.id, e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <div className="flex-1">
                    <span className="text-sm text-red-800">{task.task}</span>
                    <span className="text-xs text-red-600 ml-2">({task.estimatedTime} min)</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Before Close Cleanup */}
            <div>
              <h4 className="font-semibold text-orange-800 mb-3">Before Close (Daily)</h4>
              {beforeCloseCleanup.map(task => (
                <div key={task.id} className="flex items-center gap-3 mb-2">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={(e) => updateCleanupTask(task.id, e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <div className="flex-1">
                    <span className="text-sm text-red-800">{task.task}</span>
                    <span className="text-xs text-red-600 ml-2">({task.estimatedTime} min)</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Morning After Cleanup */}
            <div>
              <h4 className="font-semibold text-purple-800 mb-3">Morning After (Final Day)</h4>
              {morningAfterCleanup.map(task => (
                <div key={task.id} className="flex items-center gap-3 mb-2">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={(e) => updateCleanupTask(task.id, e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <div className="flex-1">
                    <span className="text-sm text-red-800">{task.task}</span>
                    <span className="text-xs text-red-600 ml-2">({task.estimatedTime} min)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <ChefHat className="h-6 w-6 text-red-600" />
          <h2 className="text-2xl font-bold text-gray-800">Kitchen Management</h2>
        </div>
        
        <button
          onClick={exportKitchenData}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Download className="h-4 w-4" />
          Export Kitchen Data
        </button>
      </div>

      {/* Kitchen Cost Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-green-50 rounded-lg p-6 border border-green-200">
          <div className="flex items-center">
            <ShoppingCart className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-green-600">Food Supply Order</p>
              <p className="text-2xl font-semibold text-green-900">${totalGroceryCost}</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
          <div className="flex items-center">
            <Gift className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-600">Kabab Gift</p>
              <p className="text-2xl font-semibold text-blue-900">${totalKababCost}</p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 rounded-lg p-6 border border-orange-200">
          <div className="flex items-center">
            <Wrench className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-orange-600">Kitchen Equipment</p>
              <p className="text-2xl font-semibold text-orange-900">${totalEquipmentCost}</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
          <div className="flex items-center">
            <Utensils className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-purple-600">Total Kitchen Budget</p>
              <p className="text-2xl font-semibold text-purple-900">${totalKitchenCost}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as KitchenTab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'health' && renderHealthOverview()}
        {activeTab === 'food-supply' && renderFoodSupply()}
        {activeTab === 'menu-planning' && renderMenuPlanning()}
        {activeTab === 'volunteer-shifts' && renderVolunteerShifts()}
        {activeTab === 'kabab-gift' && renderKababGift()}
        {activeTab === 'equipment-checklist' && renderEquipmentChecklist()}
      </div>
    </div>
  );
}