'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { additionalInfoSchema, type AdditionalInfoInput } from '@/lib/validations';
import { Calendar, Tent, Coffee, Utensils, MessageCircle } from 'lucide-react';
import Image from 'next/image';

const ARRIVAL_OPTIONS = [
  'מעוניין להגיע להקמות',
  'יום שני',
  'יום שלישי',
  'יום רביעי',
  'יום חמישי',
  'עוד לא בטוח'
];

const TENT_SIZES = [
  'אוהל 2-3 אנשים',
  'אוהל 4 אנשים',
  'אוהל 6-8',
  'אחר'
];

const MILK_OPTIONS = [
  'חלב רגיל',
  'ללא לקטוז',
  'חלב שקדים',
  'אחר'
];

const DIETARY_RESTRICTIONS = [
  'צמחוני',
  'טבעוני',
  'פירותני',
  'אחר'
];

interface MemberOption {
  id: string;
  name: string;
  email: string;
}

interface AdditionalInfoFormProps {
  onSuccess: (data: any) => void;
}

export default function AdditionalInfoForm({ onSuccess }: AdditionalInfoFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [members, setMembers] = useState<MemberOption[]>([]);
  const [loading, setLoading] = useState(true);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<AdditionalInfoInput>({
    resolver: zodResolver(additionalInfoSchema),
    defaultValues: {
      bringingTent: false,
      sharingTent: false,
      drinksCoffee: false,
      hasDietaryRestriction: false,
      wantsMattress: false,
    },
  });

  const bringingTent = watch('bringingTent');
  const sharingTent = watch('sharingTent');
  const drinksCoffee = watch('drinksCoffee');
  const hasDietaryRestriction = watch('hasDietaryRestriction');

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await fetch('/api/members-available');
        const result = await response.json();
        if (result.success) {
          setMembers(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch members:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  // Update sharing options when memberId changes
  const selectedMemberId = watch('memberId');
  useEffect(() => {
    if (!sharingTent) {
      setValue('sharingWithMemberId', undefined);
      setValue('sharingWithMemberName', undefined);
    }
  }, [sharingTent, setValue]);

  const onSubmit = async (data: AdditionalInfoInput) => {
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const response = await fetch('/api/additional-info', {
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
        setSubmitError(result.error || 'Submission failed. Please try again.');
      }
    } catch (error) {
      setSubmitError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Hidden fields for member name and email */}
      <input type="hidden" {...register('memberName')} />
      <input type="hidden" {...register('memberEmail')} />
      <input type="hidden" {...register('sharingWithMemberName')} />
      
      {/* Member Selection */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100 form-card-trippy">
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="h-5 w-5 text-orange-600 mushroom-float" />
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

      {/* When are you coming */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100 form-card-trippy">
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="h-5 w-5 text-orange-600 mushroom-float" />
          <h2 className="text-xl font-semibold text-gray-800">When are you coming? <span className="mushroom-emoji">📅</span></h2>
        </div>
        
        <div className="form-field">
          <label htmlFor="arrivalWhen" className="block text-sm font-medium text-gray-700 mb-3">
            Select your arrival time *
          </label>
          <div className="space-y-3">
            {ARRIVAL_OPTIONS.map((option) => (
              <label key={option} className="flex items-center space-x-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <input
                  {...register('arrivalWhen')}
                  type="radio"
                  value={option}
                  className="text-orange-600 focus:ring-orange-500 focus:ring-2"
                />
                <span className="text-sm text-gray-700 font-medium">{option}</span>
              </label>
            ))}
          </div>
          {errors.arrivalWhen && (
            <p className="mt-2 text-sm text-red-600">{errors.arrivalWhen.message}</p>
          )}
        </div>
      </div>

      {/* Tent Information */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100 form-card-trippy">
        <div className="flex items-center gap-2 mb-6">
          <Tent className="h-5 w-5 text-orange-600 mushroom-float" />
          <h2 className="text-xl font-semibold text-gray-800">Tent Information <span className="mushroom-emoji">⛺</span></h2>
        </div>

        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <input
              {...register('bringingTent')}
              type="checkbox"
              className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 h-5 w-5"
            />
            <label className="text-sm font-medium text-gray-700">
              I'm bringing a tent
            </label>
          </div>

          {bringingTent && (
            <>
              <div className="flex items-center space-x-3">
                <input
                  {...register('sharingTent')}
                  type="checkbox"
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 h-5 w-5"
                />
                <label className="text-sm font-medium text-gray-700">
                  I'm sharing a tent with someone
                </label>
              </div>

              {sharingTent && (
                <div className="form-field">
                  <label htmlFor="sharingWithMemberId" className="block text-sm font-medium text-gray-700 mb-2">
                    Who are you sharing a tent with? *
                  </label>
                  <Controller
                    name="sharingWithMemberId"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                        onChange={(e) => {
                          const selectedMember = members.find(m => m.id === e.target.value);
                          if (selectedMember) {
                            setValue('sharingWithMemberId', selectedMember.id);
                            setValue('sharingWithMemberName', selectedMember.name);
                            field.onChange(e.target.value);
                          } else {
                            setValue('sharingWithMemberId', undefined);
                            setValue('sharingWithMemberName', undefined);
                            field.onChange('');
                          }
                        }}
                      >
                        <option value="">Select member</option>
                        {members
                          .filter(m => m.id !== selectedMemberId)
                          .map((member) => (
                            <option key={member.id} value={member.id}>
                              {member.name} - {member.email}
                            </option>
                          ))}
                      </select>
                    )}
                  />
                  {errors.sharingWithMemberId && (
                    <p className="mt-1 text-sm text-red-600">{errors.sharingWithMemberId.message}</p>
                  )}
                </div>
              )}

              <div className="form-field">
                <label htmlFor="tentSize" className="block text-sm font-medium text-gray-700 mb-2">
                  Tent Size *
                </label>
                <select
                  {...register('tentSize')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                >
                  <option value="">Select tent size</option>
                  {TENT_SIZES.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
                {errors.tentSize && (
                  <p className="mt-1 text-sm text-red-600">{errors.tentSize.message}</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Coffee & Food Preferences */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100 form-card-trippy">
        <div className="flex items-center gap-2 mb-6">
          <Coffee className="h-5 w-5 text-orange-600 mushroom-float" />
          <h2 className="text-xl font-semibold text-gray-800">Coffee & Food Preferences <span className="mushroom-emoji">☕🍽️</span></h2>
        </div>

        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <input
              {...register('drinksCoffee')}
              type="checkbox"
              className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 h-5 w-5"
            />
            <label className="text-sm font-medium text-gray-700">
              I drink coffee
            </label>
          </div>

          {drinksCoffee && (
            <div className="form-field">
              <label htmlFor="milkPreference" className="block text-sm font-medium text-gray-700 mb-2">
                Milk Preference *
              </label>
              <select
                {...register('milkPreference')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              >
                <option value="">Select milk preference</option>
                {MILK_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errors.milkPreference && (
                <p className="mt-1 text-sm text-red-600">{errors.milkPreference.message}</p>
              )}
            </div>
          )}

          <div className="flex items-center space-x-3">
            <input
              {...register('hasDietaryRestriction')}
              type="checkbox"
              className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 h-5 w-5"
            />
            <label className="text-sm font-medium text-gray-700">
              I have a dietary restriction
            </label>
          </div>

          {hasDietaryRestriction && (
            <div className="form-field">
              <label htmlFor="dietaryRestrictionType" className="block text-sm font-medium text-gray-700 mb-2">
                Dietary Restriction Type *
              </label>
              <select
                {...register('dietaryRestrictionType')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              >
                <option value="">Select dietary restriction</option>
                {DIETARY_RESTRICTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errors.dietaryRestrictionType && (
                <p className="mt-1 text-sm text-red-600">{errors.dietaryRestrictionType.message}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mattress Order */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100 form-card-trippy">
        <div className="flex items-center gap-2 mb-6">
          <Tent className="h-5 w-5 text-orange-600 mushroom-float" />
          <h2 className="text-xl font-semibold text-gray-800">Mattress Order <span className="mushroom-emoji">🛏️</span></h2>
        </div>

        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 mb-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <Image 
                src="/mattress.png" 
                alt="Mattress" 
                width={100} 
                height={100}
                className="rounded-lg border border-gray-200"
              />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-700 mb-2">
                I would like to order a mattress that will arrive to the burn (190x90x10) for additional 60 NIS
              </p>
              <div className="flex items-center space-x-3">
                <input
                  {...register('wantsMattress')}
                  type="checkbox"
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 h-5 w-5"
                />
                <label className="text-sm font-medium text-gray-700">
                  Yes, I want to order a mattress (60 NIS)
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Comments */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-orange-100 form-card-trippy">
        <div className="flex items-center gap-2 mb-6">
          <MessageCircle className="h-5 w-5 text-orange-600 mushroom-float" />
          <h2 className="text-xl font-semibold text-gray-800">Additional Comments <span className="mushroom-emoji">💭</span></h2>
        </div>

        <div className="form-field">
          <textarea
            {...register('comments')}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
            placeholder="Anything else you'd like us to know?"
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
          className="w-full psychedelic-bg text-white py-4 px-8 rounded-lg font-semibold text-lg hover:scale-105 focus:ring-4 focus:ring-purple-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed rainbow-shadow mushroom-float"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center gap-3">
              <div className="spinner h-5 w-5"></div>
              Submitting... <span className="mushroom-emoji">🌀</span>
            </div>
          ) : (
            'Submit Additional Information 🔥🍄🌈✨'
          )}
        </button>

        <p className="mt-4 text-xs text-gray-500 text-center">
          By submitting this form, you provide additional information to help us organize the camp better.
        </p>
      </div>
    </form>
  );
}
