'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { memberRegistrationSchema, type MemberRegistrationInput } from '@/lib/validations';
import { Calendar, User, Mail, Phone, Heart, Utensils, Car, Star, MessageCircle } from 'lucide-react';

const CAMP_ROLES = [
  'Camp Lead',
  'Kitchen Manager', 
  'Build Team',
  'Art Team',
  'Safety Officer',
  'Medic',
  'DJ/Music',
  'Photographer',
  'General Member',
  'Other'
];

const DIETARY_OPTIONS = [
  'Vegetarian',
  'Vegan', 
  'Gluten-Free',
  'Halal',
  'Lactose Intolerant',
  'Other'
];

const ARRIVAL_DAYS = [
  'Saturday',
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday'
];

const TICKET_STATUS_OPTIONS = [
  'Yes I bought via Camp',
  'Yes I bought via other Department',
  'No - but should get a ticket via other department',
  'No - no lead for a ticket at this stage'
];

interface RegistrationFormProps {
  onSuccess: (data: any) => void;
}

export default function RegistrationForm({ onSuccess }: RegistrationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<MemberRegistrationInput>({
    resolver: zodResolver(memberRegistrationSchema),
    defaultValues: {
      dietaryRestrictions: [],
      specialSkills: [],
      previousBurns: 0,
      needsTransport: false,
      hasVehicle: false,
      medicalConditions: '',
      allergies: '',
      comments: '',
      vehicleDetails: '',
      canArriveEarly: false,
      arrivalDays: [],
      agreesToStayTillSaturday: false,
      ticketStatus: '',
    },
  });

  const hasVehicle = watch('hasVehicle');

  const onSubmit = async (data: MemberRegistrationInput) => {
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const response = await fetch('/api/members', {
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
      } else {
        setSubmitError(result.error || 'Registration failed. Please try again.');
      }
    } catch (error) {
      setSubmitError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Personal Information */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
        <div className="flex items-center gap-2 mb-6">
          <User className="h-5 w-5 text-orange-600" />
          <h2 className="text-xl font-semibold text-gray-800">Personal Information</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-field">
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
              First Name *
            </label>
            <input
              {...register('firstName')}
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              placeholder="Your first name"
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
              Last Name *
            </label>
            <input
              {...register('lastName')}
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              placeholder="Your last name"
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="inline h-4 w-4 mr-1" />
              Email Address *
            </label>
            <input
              {...register('email')}
              type="email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              placeholder="your.email@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="inline h-4 w-4 mr-1" />
              Phone Number *
            </label>
            <input
              {...register('phone')}
              type="tel"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              placeholder="+972-50-123-4567"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Ticket Information */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
        <div className="flex items-center gap-2 mb-6">
          <Star className="h-5 w-5 text-orange-600" />
          <h2 className="text-xl font-semibold text-gray-800">Ticket Information</h2>
        </div>

        <div className="form-field">
          <label htmlFor="ticketStatus" className="block text-sm font-medium text-gray-700 mb-3">
            Do you already have a ticket? *
          </label>
          <div className="space-y-3">
            {TICKET_STATUS_OPTIONS.map((option) => (
              <label key={option} className="flex items-center space-x-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <input
                  {...register('ticketStatus')}
                  type="radio"
                  value={option}
                  className="text-orange-600 focus:ring-orange-500 focus:ring-2"
                />
                <span className="text-sm text-gray-700 font-medium">{option}</span>
              </label>
            ))}
          </div>
          {errors.ticketStatus && (
            <p className="mt-2 text-sm text-red-600">{errors.ticketStatus.message}</p>
          )}
        </div>
      </div>

      {/* Camp Information */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
        <div className="flex items-center gap-2 mb-6">
          <Star className="h-5 w-5 text-orange-600" />
          <h2 className="text-xl font-semibold text-gray-800">Camp Information</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-field">
            <label htmlFor="campRole" className="block text-sm font-medium text-gray-700 mb-2">
              Camp Role *
            </label>
            <select
              {...register('campRole')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            >
              <option value="">Select your role</option>
              {CAMP_ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            {errors.campRole && (
              <p className="mt-1 text-sm text-red-600">{errors.campRole.message}</p>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="previousBurns" className="block text-sm font-medium text-gray-700 mb-2">
              Previous Burns
            </label>
            <input
              {...register('previousBurns', { valueAsNumber: true })}
              type="number"
              min="0"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              placeholder="0"
            />
            {errors.previousBurns && (
              <p className="mt-1 text-sm text-red-600">{errors.previousBurns.message}</p>
            )}
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Special Skills (separate with commas)
          </label>
          <Controller
            name="specialSkills"
            control={control}
            render={({ field }) => (
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                placeholder="e.g., Carpentry, First Aid, DJ, Photography"
                onChange={(e) => {
                  const skills = e.target.value.split(',').map(skill => skill.trim()).filter(Boolean);
                  field.onChange(skills);
                }}
              />
            )}
          />
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
        <div className="flex items-center gap-2 mb-6">
          <Heart className="h-5 w-5 text-orange-600" />
          <h2 className="text-xl font-semibold text-gray-800">Emergency Contact</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="form-field">
            <label htmlFor="emergencyContact.name" className="block text-sm font-medium text-gray-700 mb-2">
              Contact Name *
            </label>
            <input
              {...register('emergencyContact.name')}
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              placeholder="Full name"
            />
            {errors.emergencyContact?.name && (
              <p className="mt-1 text-sm text-red-600">{errors.emergencyContact.name.message}</p>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="emergencyContact.phone" className="block text-sm font-medium text-gray-700 mb-2">
              Contact Phone *
            </label>
            <input
              {...register('emergencyContact.phone')}
              type="tel"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              placeholder="+972-50-123-4567"
            />
            {errors.emergencyContact?.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.emergencyContact.phone.message}</p>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="emergencyContact.relationship" className="block text-sm font-medium text-gray-700 mb-2">
              Relationship *
            </label>
            <input
              {...register('emergencyContact.relationship')}
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              placeholder="e.g., Parent, Spouse, Friend"
            />
            {errors.emergencyContact?.relationship && (
              <p className="mt-1 text-sm text-red-600">{errors.emergencyContact.relationship.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Dietary & Medical */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
        <div className="flex items-center gap-2 mb-6">
          <Utensils className="h-5 w-5 text-orange-600" />
          <h2 className="text-xl font-semibold text-gray-800">Dietary & Medical Information</h2>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Dietary Restrictions
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {DIETARY_OPTIONS.map((option) => (
                <label key={option} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    {...register('dietaryRestrictions')}
                    type="checkbox"
                    value={option}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-field">
              <label htmlFor="medicalConditions" className="block text-sm font-medium text-gray-700 mb-2">
                Medical Conditions
              </label>
              <textarea
                {...register('medicalConditions')}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
                placeholder="Any medical conditions we should know about..."
              />
            </div>

            <div className="form-field">
              <label htmlFor="allergies" className="block text-sm font-medium text-gray-700 mb-2">
                Allergies
              </label>
              <textarea
                {...register('allergies')}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
                placeholder="Any allergies we should know about..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Logistics */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="h-5 w-5 text-orange-600" />
          <h2 className="text-xl font-semibold text-gray-800">Logistics</h2>
        </div>

        <div className="space-y-6">
          {/* Build Days Availability */}
          <div className="form-field">
            <div className="flex items-center space-x-3">
              <input
                {...register('canArriveEarly')}
                type="checkbox"
                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 h-5 w-5"
              />
              <label className="text-sm font-medium text-gray-700">
                Can you arrive for the building days (Sat & Sun 22/23 Nov)?
              </label>
            </div>
          </div>

          {/* Arrival Days */}
          <div className="form-field">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Arrival Days (Select all days you can arrive) *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {ARRIVAL_DAYS.map((day) => (
                <label key={day} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    {...register('arrivalDays')}
                    type="checkbox"
                    value={day}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-700">{day}</span>
                </label>
              ))}
            </div>
            {errors.arrivalDays && (
              <p className="mt-1 text-sm text-red-600">{errors.arrivalDays.message}</p>
            )}
          </div>

          {/* Mandatory commitment checkbox */}
          <div className="form-field bg-orange-50 p-4 rounded-lg border border-orange-200">
            <div className="flex items-start space-x-3">
              <input
                {...register('agreesToStayTillSaturday')}
                type="checkbox"
                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 h-5 w-5 mt-0.5"
              />
              <label className="text-sm font-medium text-gray-700">
                I understand I need to stay till Saturday and help with the camp packing *
              </label>
            </div>
            {errors.agreesToStayTillSaturday && (
              <p className="mt-1 text-sm text-red-600">{errors.agreesToStayTillSaturday.message}</p>
            )}
          </div>

          {/* Transportation */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <input
                {...register('needsTransport')}
                type="checkbox"
                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 h-5 w-5"
              />
              <label className="text-sm font-medium text-gray-700">
                I need transportation to/from the event
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                {...register('hasVehicle')}
                type="checkbox"
                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 h-5 w-5"
              />
              <label className="text-sm font-medium text-gray-700">
                I have a vehicle and can help with transportation
              </label>
            </div>

            {hasVehicle && (
              <div className="form-field mt-4">
                <label htmlFor="vehicleDetails" className="block text-sm font-medium text-gray-700 mb-2">
                  <Car className="inline h-4 w-4 mr-1" />
                  Vehicle Details
                </label>
                <input
                  {...register('vehicleDetails')}
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  placeholder="e.g., Toyota Corolla, 4 seats available"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Additional Comments */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100">
        <div className="flex items-center gap-2 mb-6">
          <MessageCircle className="h-5 w-5 text-orange-600" />
          <h2 className="text-xl font-semibold text-gray-800">Additional Comments</h2>
        </div>

        <div className="form-field">
          <textarea
            {...register('comments')}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
            placeholder="Anything else you'd like us to know? Questions, special requests, or just say hi!"
          />
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
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 px-8 rounded-lg font-semibold text-lg hover:from-orange-600 hover:to-red-600 focus:ring-4 focus:ring-orange-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center gap-3">
              <div className="spinner h-5 w-5"></div>
              Submitting Registration...
            </div>
          ) : (
            'Complete Registration 🔥'
          )}
        </button>

        <p className="mt-4 text-xs text-gray-500 text-center">
          By submitting this form, you agree to participate in our camp activities and follow Midburn principles.
        </p>
      </div>
    </form>
  );
}
