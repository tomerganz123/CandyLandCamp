'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { kitchenShiftSchema, type KitchenShiftInput } from '@/lib/validations';
import { ChefHat, Users, Clock, Calendar, CheckCircle, AlertCircle } from 'lucide-react';

interface MemberOption {
  id: string;
  name: string;
  email: string;
}

interface ShiftAvailability {
  day: string;
  shiftTime: 'morning' | 'evening';
  capacity: number;
  managerCount: number;
  volunteerCount: number;
  totalRegistered: number;
  availableSpots: number;
  needsManager: boolean;
  canRegisterVolunteer: boolean;
  canRegisterManager: boolean;
  registeredMembers: { name: string; role: string }[];
}

interface KitchenShiftFormProps {
  onSuccess: (data: any) => void;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const SHIFT_TIMES = {
  morning: { label: 'Morning Shift', time: '7:00 AM - 10:00 AM', capacity: 5 },
  evening: { label: 'Evening Shift', time: '6:00 PM - 9:00 PM', capacity: 6 }
};

export default function KitchenShiftForm({ onSuccess }: KitchenShiftFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [members, setMembers] = useState<MemberOption[]>([]);
  const [availability, setAvailability] = useState<ShiftAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedShift, setSelectedShift] = useState<ShiftAvailability | null>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<KitchenShiftInput>({
    resolver: zodResolver(kitchenShiftSchema),
  });

  const selectedDay = watch('day');
  const selectedShiftTime = watch('shiftTime');
  const selectedRole = watch('role');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all approved members (not just those who haven't filled additional info)
        const membersResponse = await fetch('/api/members?approved=true');
        const membersResult = await membersResponse.json();
        if (membersResult.success) {
          // Transform member data to match the expected format
          const transformedMembers = membersResult.data.members.map((member: any) => ({
            id: member._id,
            name: `${member.firstName} ${member.lastName}`,
            email: member.email
          }));
          setMembers(transformedMembers);
        }

        // Fetch availability
        const availabilityResponse = await fetch('/api/kitchen-shifts?availability=true');
        const availabilityResult = await availabilityResponse.json();
        if (availabilityResult.success) {
          setAvailability(availabilityResult.data);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Update selected shift when day/time changes
  useEffect(() => {
    if (selectedDay && selectedShiftTime) {
      const shift = availability.find(
        a => a.day === selectedDay && a.shiftTime === selectedShiftTime
      );
      setSelectedShift(shift || null);
      
      // Auto-select role based on availability
      if (shift) {
        if (shift.needsManager && shift.canRegisterManager) {
          setValue('role', 'manager');
        } else if (shift.canRegisterVolunteer) {
          setValue('role', 'volunteer');
        }
      }
    } else {
      setSelectedShift(null);
    }
  }, [selectedDay, selectedShiftTime, availability, setValue]);

  const onSubmit = async (data: KitchenShiftInput) => {
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const response = await fetch('/api/kitchen-shifts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        onSuccess(result);
        reset();
        
        // Refresh availability
        const availabilityResponse = await fetch('/api/kitchen-shifts?availability=true');
        const availabilityResult = await availabilityResponse.json();
        if (availabilityResult.success) {
          setAvailability(availabilityResult.data);
        }
      } else {
        setSubmitError(result.error || 'Submission failed. Please try again.');
      }
    } catch (error) {
      setSubmitError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAvailableShifts = () => {
    if (!selectedDay) return [];
    
    return availability.filter(a => a.day === selectedDay);
  };

  const canSubmit = selectedShift && 
    ((selectedRole === 'manager' && selectedShift.canRegisterManager) ||
     (selectedRole === 'volunteer' && selectedShift.canRegisterVolunteer));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Hidden fields */}
      <input type="hidden" {...register('memberName')} />
      <input type="hidden" {...register('memberEmail')} />
      
      {/* Member Selection */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100 form-card-trippy">
        <div className="flex items-center gap-2 mb-6">
          <Users className="h-5 w-5 text-orange-600 mushroom-float" />
          <h2 className="text-xl font-semibold text-gray-800">Select Yourself <span className="mushroom-emoji">👤</span></h2>
        </div>
        
        <div className="form-field">
          <label htmlFor="memberId" className="block text-sm font-medium text-gray-700 mb-2">
            Choose your name from the list *
          </label>
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            </div>
          ) : (
            <Controller
              name="memberId"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  onChange={(e) => {
                    const selectedMember = members.find(m => m.id === e.target.value);
                    if (selectedMember) {
                      setValue('memberId', selectedMember.id);
                      setValue('memberName', selectedMember.name);
                      setValue('memberEmail', selectedMember.email);
                      field.onChange(e.target.value);
                    } else {
                      setValue('memberId', '');
                      setValue('memberName', '');
                      setValue('memberEmail', '');
                      field.onChange('');
                    }
                  }}
                >
                  <option value="">Select your name from the list</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name} - {member.email}
                    </option>
                  ))}
                </select>
              )}
            />
          )}
          {errors.memberId && (
            <p className="mt-1 text-sm text-red-600">{errors.memberId.message}</p>
          )}
        </div>
      </div>

      {/* Shift Selection */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100 form-card-trippy">
        <div className="flex items-center gap-2 mb-6">
          <ChefHat className="h-5 w-5 text-orange-600 mushroom-float" />
          <h2 className="text-xl font-semibold text-gray-800">Select Your Kitchen Shift <span className="mushroom-emoji">🍳</span></h2>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Kitchen Shift Requirements:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Morning shifts need <strong>5 volunteers</strong> (including 1 shift manager)</li>
                <li>Evening shifts need <strong>6 volunteers</strong> (including 1 shift manager)</li>
                <li>Shift managers must be assigned first before other volunteers can register</li>
                <li>Target: 1 shift per member during the week</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          {/* Day Selection */}
          <div className="form-field">
            <label htmlFor="day" className="block text-sm font-medium text-gray-700 mb-3">
              Select Day *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {DAYS.map((day) => {
                const dayShifts = availability.filter(a => a.day === day);
                const hasAvailability = dayShifts.some(s => s.availableSpots > 0);
                
                return (
                  <label 
                    key={day} 
                    className={`flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedDay === day 
                        ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-500' 
                        : hasAvailability
                          ? 'border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                          : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <input
                      {...register('day')}
                      type="radio"
                      value={day}
                      className="sr-only"
                      disabled={!hasAvailability}
                    />
                    <Calendar className="h-5 w-5 text-orange-600 mb-2" />
                    <span className="text-sm font-medium text-gray-700">{day}</span>
                    {!hasAvailability && (
                      <span className="text-xs text-red-600 mt-1">Full</span>
                    )}
                  </label>
                );
              })}
            </div>
            {errors.day && (
              <p className="mt-2 text-sm text-red-600">{errors.day.message}</p>
            )}
          </div>

          {/* Shift Time Selection */}
          {selectedDay && (
            <div className="form-field">
              <label htmlFor="shiftTime" className="block text-sm font-medium text-gray-700 mb-3">
                Select Shift Time *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(Object.entries(SHIFT_TIMES) as [keyof typeof SHIFT_TIMES, typeof SHIFT_TIMES[keyof typeof SHIFT_TIMES]][]).map(([time, info]) => {
                  const shiftAvail = getAvailableShifts().find(s => s.shiftTime === time);
                  const hasSpots = shiftAvail && shiftAvail.availableSpots > 0;
                  
                  return (
                    <label 
                      key={time} 
                      className={`flex flex-col p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedShiftTime === time 
                          ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-500' 
                          : hasSpots
                            ? 'border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                            : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <input
                        {...register('shiftTime')}
                        type="radio"
                        value={time}
                        className="sr-only"
                        disabled={!hasSpots}
                      />
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-orange-600" />
                          <span className="font-semibold text-gray-900">{info.label}</span>
                        </div>
                        {shiftAvail && (
                          <span className={`text-xs font-medium ${hasSpots ? 'text-green-600' : 'text-red-600'}`}>
                            {shiftAvail.availableSpots} spots left
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-gray-600">{info.time}</span>
                      {shiftAvail && (
                        <div className="mt-2 text-xs text-gray-500">
                          {shiftAvail.totalRegistered}/{info.capacity} registered
                          {shiftAvail.needsManager && (
                            <span className="text-orange-600 font-medium ml-2">⚠️ Needs manager</span>
                          )}
                        </div>
                      )}
                    </label>
                  );
                })}
              </div>
              {errors.shiftTime && (
                <p className="mt-2 text-sm text-red-600">{errors.shiftTime.message}</p>
              )}
            </div>
          )}

          {/* Role Selection */}
          {selectedShift && (
            <div className="form-field">
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-3">
                Select Your Role *
              </label>
              <div className="space-y-3">
                {/* Shift Manager Option */}
                <label 
                  className={`flex items-start p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedRole === 'manager' 
                      ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-500' 
                      : selectedShift.canRegisterManager
                        ? 'border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                        : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <input
                    {...register('role')}
                    type="radio"
                    value="manager"
                    className="mt-1 text-orange-600 focus:ring-orange-500"
                    disabled={!selectedShift.canRegisterManager}
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">Shift Manager</span>
                      {selectedShift.needsManager && (
                        <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">Needed!</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Lead the shift, coordinate tasks, ensure everything runs smoothly
                    </p>
                    {!selectedShift.canRegisterManager && selectedShift.managerCount >= 1 && (
                      <p className="text-xs text-red-600 mt-1">Manager position already filled</p>
                    )}
                  </div>
                </label>

                {/* Regular Volunteer Option */}
                <label 
                  className={`flex items-start p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedRole === 'volunteer' 
                      ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-500' 
                      : selectedShift.canRegisterVolunteer
                        ? 'border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                        : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <input
                    {...register('role')}
                    type="radio"
                    value="volunteer"
                    className="mt-1 text-orange-600 focus:ring-orange-500"
                    disabled={!selectedShift.canRegisterVolunteer}
                  />
                  <div className="ml-3 flex-1">
                    <span className="font-medium text-gray-900">Volunteer</span>
                    <p className="text-sm text-gray-600 mt-1">
                      Help with food prep, cooking, serving, and cleanup
                    </p>
                    {!selectedShift.canRegisterVolunteer && selectedShift.needsManager && (
                      <p className="text-xs text-red-600 mt-1">
                        A shift manager must be assigned first before volunteers can register
                      </p>
                    )}
                  </div>
                </label>
              </div>
              {errors.role && (
                <p className="mt-2 text-sm text-red-600">{errors.role.message}</p>
              )}
            </div>
          )}

          {/* Current Registrations */}
          {selectedShift && selectedShift.registeredMembers.length > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-800 mb-2">Currently Registered:</h4>
              <ul className="space-y-1">
                {selectedShift.registeredMembers.map((member, idx) => (
                  <li key={idx} className="text-sm text-gray-700 flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    <span>{member.name}</span>
                    <span className="text-xs text-gray-500">({member.role})</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Submit Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
        {submitError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg error-shake">
            <p className="text-red-800 text-sm">{submitError}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !canSubmit}
          className="w-full psychedelic-bg text-white py-4 px-8 rounded-lg font-semibold text-lg hover:scale-105 focus:ring-4 focus:ring-purple-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed rainbow-shadow mushroom-float"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center gap-3">
              <div className="spinner h-5 w-5"></div>
              Registering... <span className="mushroom-emoji">🌀</span>
            </div>
          ) : (
            'Register for Kitchen Shift 🍳✨'
          )}
        </button>

        <p className="mt-4 text-xs text-gray-500 text-center">
          By registering, you commit to helping with kitchen duties during your selected shift.
        </p>
      </div>
    </form>
  );
}

