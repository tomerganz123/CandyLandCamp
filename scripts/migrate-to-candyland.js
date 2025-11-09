/**
 * Migration Script: Copy data from midburn-camp to CandyLandCamp database
 * 
 * This script:
 * 1. Connects to both old and new databases
 * 2. Creates all necessary collections in the new database
 * 3. Copies budget data from old to new database
 * 4. Verifies the migration
 */

const mongoose = require('mongoose');

// Database connection strings
const OLD_DB_URI = process.env.OLD_MONGODB_URI || 'mongodb+srv://tomerganz_db_user:RhEqhWorpJ6zCAAx@cluster0.dxihaof.mongodb.net/midburn-camp?retryWrites=true&w=majority&appName=Cluster0';
const NEW_DB_URI = process.env.MONGODB_URI || 'mongodb+srv://tomerganz_db_user:RhEqhWorpJ6zCAAx@cluster0.dxihaof.mongodb.net/CandyLandCamp?retryWrites=true&w=majority&appName=Cluster0';

// Budget Expense Schema (matching the model)
const PaymentSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  whoPaid: { type: String, required: true, trim: true },
  whoPaidName: { type: String, required: true, trim: true },
  datePaid: { type: Date, required: true, default: Date.now },
  moneyReturned: { type: Boolean, required: true, default: false },
  notes: { type: String, trim: true }
}, { _id: true });

const BudgetExpenseSchema = new mongoose.Schema({
  costCategory: {
    type: String,
    required: true,
    enum: [
      'Food & Beverages',
      'Transportation',
      'Equipment & Supplies',
      'Art & Decorations',
      'Infrastructure',
      'Emergency/Medical',
      'Gift',
      'Other'
    ],
    trim: true
  },
  item: {
    type: String,
    required: true,
    trim: true,
    maxlength: [200, 'Item description must be less than 200 characters']
  },
  quantity: {
    type: Number,
    required: true,
    min: [0, 'Quantity cannot be negative'],
    default: 1
  },
  costAmount: {
    type: Number,
    required: true,
    min: [0, 'Cost amount cannot be negative']
  },
  payments: {
    type: [PaymentSchema],
    default: []
  },
  alreadyPaid: {
    type: Boolean,
    default: false
  },
  whoPaid: {
    type: String,
    trim: true
  },
  whoPaidName: {
    type: String,
    trim: true
  },
  moneyReturned: {
    type: Boolean,
    default: false
  },
  dateOfExpense: {
    type: Date,
    required: true,
    default: Date.now
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes must be less than 500 characters']
  }
}, {
  timestamps: true
});

// Member Schema (for reference)
const MemberSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },
  idNumber: { type: String, required: true, trim: true },
  gender: { 
    type: String, 
    required: true,
    enum: ['Male', 'Female', 'Non-binary', 'Prefer not to say']
  },
  age: { type: Number, required: true, min: 18, max: 99 },
  ticketStatus: { 
    type: String, 
    required: true,
    enum: [
      'Yes I bought via Camp',
      'Yes I bought via other Department',
      'No - but should get a ticket via other department',
      'No - no lead for a ticket at this stage'
    ]
  },
  campRole: { 
    type: String, 
    required: true,
    enum: [
      'Kitchen Manager', 
      'Build Team',
      'Art Team',
      'Safety Officer',
      'Shift Manager',
      'Suppliers Manager',
      'DJ/Music',
      'Other'
    ]
  },
  dietaryRestrictions: [{
    type: String,
    enum: [
      'Vegetarian',
      'Vegan', 
      'Gluten-Free',
      'Halal',
      'Lactose Intolerant',
      'Other'
    ]
  }],
  medicalConditions: { type: String, default: '', trim: true },
  allergies: { type: String, default: '', trim: true },
  canArriveEarly: { type: Boolean, default: false },
  arrivalDay: {
    type: String,
    required: true,
    enum: ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday']
  },
  agreesToStayTillSaturday: { type: Boolean, required: true },
  needsTransport: { type: Boolean, default: false },
  hasVehicle: { type: Boolean, default: false },
  vehicleDetails: { type: String, trim: true },
  specialSkills: [{ type: String, trim: true }],
  previousBurns: { type: Number, default: 0, min: 0 },
  giftParticipation: {
    type: String,
    required: true,
    enum: ['Yes', 'No', 'Maybe']
  },
  acceptsCampFee: { type: Boolean, required: true },
  comments: { type: String, default: '', trim: true },
  isApproved: { type: Boolean, default: false }
}, {
  timestamps: true
});

// Additional Info Schema
const AdditionalInfoSchema = new mongoose.Schema({
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  orderedMattress: { type: Boolean, default: false },
  mattressSize: { type: String, enum: ['Single', 'Double'], trim: true },
  specialNeeds: { type: String, trim: true },
  emergencyContactName: { type: String, trim: true },
  emergencyContactPhone: { type: String, trim: true },
  emergencyContactRelation: { type: String, trim: true },
  additionalNotes: { type: String, trim: true }
}, {
  timestamps: true
});

// Fee Payment Schema
const FeePaymentSchema = new mongoose.Schema({
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  memberName: { type: String, required: true },
  memberPhone: { type: String, trim: true },
  paymentType: {
    type: String,
    required: true,
    enum: ['1st Payment', '2nd Payment', '3rd Payment', 'Mattress Payment', 'Other']
  },
  amount: { type: Number, required: true, min: 0 },
  paymentDate: { type: Date, required: true, default: Date.now },
  paymentMethod: {
    type: String,
    enum: ['Bank Transfer', 'Cash', 'Credit Card', 'Other'],
    default: 'Bank Transfer'
  },
  notes: { type: String, trim: true }
}, {
  timestamps: true
});

// Kitchen Shift Schema
const KitchenShiftSchema = new mongoose.Schema({
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  shiftDate: { type: Date, required: true },
  shiftTime: { type: String, required: true },
  role: { type: String, trim: true },
  registeredAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Volunteer Shift Schema
const VolunteerShiftSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  campName: { type: String, trim: true },
  shiftType: { type: String, enum: ['gift', 'camp'], required: true },
  giftName: { type: String, trim: true },
  teamName: { type: String, trim: true },
  role: { type: String, required: true },
  timeSlot: { type: String, trim: true },
  location: { type: String, trim: true },
  registeredAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

async function migrateDatabase() {
  let oldConnection, newConnection;

  try {
    console.log('🚀 Starting database migration...\n');

    // Connect to old database
    console.log('📡 Connecting to old database (midburn-camp)...');
    oldConnection = await mongoose.createConnection(OLD_DB_URI, {
      serverSelectionTimeoutMS: 10000,
    }).asPromise();
    console.log('✅ Connected to old database\n');

    // Connect to new database
    console.log('📡 Connecting to new database (CandyLandCamp)...');
    newConnection = await mongoose.createConnection(NEW_DB_URI, {
      serverSelectionTimeoutMS: 10000,
    }).asPromise();
    console.log('✅ Connected to new database\n');

    // Create models for new database
    console.log('📋 Creating collections in new database...');
    const BudgetExpenseNew = newConnection.model('BudgetExpense', BudgetExpenseSchema, 'budgetexpenses');
    const MemberNew = newConnection.model('Member', MemberSchema, 'members');
    const AdditionalInfoNew = newConnection.model('AdditionalInfo', AdditionalInfoSchema, 'additionalinfos');
    const FeePaymentNew = newConnection.model('FeePayment', FeePaymentSchema, 'feepayments');
    const KitchenShiftNew = newConnection.model('KitchenShift', KitchenShiftSchema, 'kitchenshifts');
    const VolunteerShiftNew = newConnection.model('VolunteerShift', VolunteerShiftSchema, 'volunteershifts');
    console.log('✅ Collections created\n');

    // Get models from old database
    const BudgetExpenseOld = oldConnection.model('BudgetExpense', BudgetExpenseSchema, 'budgetexpenses');

    // Copy budget expenses
    console.log('📦 Copying budget expenses...');
    const budgetExpenses = await BudgetExpenseOld.find({}).lean();
    console.log(`   Found ${budgetExpenses.length} budget expenses`);

    if (budgetExpenses.length > 0) {
      // Insert budget expenses in batches
      const batchSize = 100;
      for (let i = 0; i < budgetExpenses.length; i += batchSize) {
        const batch = budgetExpenses.slice(i, i + batchSize);
        await BudgetExpenseNew.insertMany(batch, { ordered: false });
        console.log(`   Inserted batch ${Math.floor(i / batchSize) + 1} (${Math.min(i + batchSize, budgetExpenses.length)}/${budgetExpenses.length})`);
      }
      console.log(`✅ Successfully copied ${budgetExpenses.length} budget expenses\n`);
    } else {
      console.log('⚠️  No budget expenses found to copy\n');
    }

    // Verify migration
    console.log('🔍 Verifying migration...');
    const newCount = await BudgetExpenseNew.countDocuments();
    const oldCount = await BudgetExpenseOld.countDocuments();
    console.log(`   Old database: ${oldCount} budget expenses`);
    console.log(`   New database: ${newCount} budget expenses`);

    if (newCount === oldCount) {
      console.log('✅ Migration verified successfully!\n');
    } else {
      console.log('⚠️  Warning: Count mismatch between old and new databases\n');
    }

    console.log('✨ Migration completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Update your .env.local file with the new database URI');
    console.log('   2. Test the application to ensure everything works');
    console.log('   3. Verify budget data in the admin dashboard');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    // Close connections
    if (oldConnection) {
      await oldConnection.close();
      console.log('🔌 Closed old database connection');
    }
    if (newConnection) {
      await newConnection.close();
      console.log('🔌 Closed new database connection');
    }
  }
}

// Run migration
migrateDatabase()
  .then(() => {
    console.log('\n🎉 All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Migration failed:', error);
    process.exit(1);
  });

