"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Phone, Mail, MapPin, CheckCircle, AlertCircle, GraduationCap, Target } from "lucide-react";
import toast from 'react-hot-toast';

// Validation schema for Government Registration
const govtRegistrationSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(50, "Full name must not exceed 50 characters"),
  phoneNumber: z.string().regex(/^01[3-9]\d{8}$/, "Phone number must be a valid 11-digit number starting with 01"),
  email: z.string().email("Please enter a valid email address"),
  address: z.string().min(10, "Address must be at least 10 characters").max(200, "Address must not exceed 200 characters"),
  courseName: z.string().min(1, "Please select a course"),
  educationLevel: z.string().min(1, "Please select your education level"),
  whyJoin: z.string().min(20, "Please provide at least 20 characters").max(500, "Why join must not exceed 500 characters"),
  agreeToTerms: z.boolean().refine((val) => val === true, "You must agree to the terms and conditions"),
});

type GovtRegistrationFormData = z.infer<typeof govtRegistrationSchema>;

interface GovtRegistrationFormProps {
  courseName?: string;
  onSuccess?: (data: GovtRegistrationFormData) => void;
  className?: string;
}

const GovtRegistrationForm = ({ courseName = "", onSuccess, className = "" }: GovtRegistrationFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, touchedFields },
    reset,
    setValue
  } = useForm<GovtRegistrationFormData>({
    resolver: zodResolver(govtRegistrationSchema),
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      email: "",
      address: "",
      courseName: courseName,
      educationLevel: "",
      whyJoin: "",
      agreeToTerms: false,
    },
  });

  const onSubmit = async (data: GovtRegistrationFormData) => {
    setIsSubmitting(true);
    try {
      // Send data to API
      const response = await fetch('/api/enrollment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          category: 'GOVERNMENT'
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Show success toast
        toast.success('Enrollment submitted successfully');
        
        // Call success callback
        if (onSuccess) {
          onSuccess(data);
        }
        
        // Reset form
        reset();
      } else {
        // Show error toast
        toast.error(result.message || 'Failed to submit enrollment');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const educationLevels = [
    { value: "ssc", label: "SSC" },
    { value: "hsc", label: "HSC" },
    { value: "bachelor", label: "Bachelor's Degree" },
    { value: "master", label: "Master's Degree" },
    { value: "phd", label: "PhD" },
    { value: "other", label: "Other" },
  ];

  const governmentCourses = [
    "Government Job Preparation",
    "Civil Services Foundation",
    "Banking Exam Preparation",
    "SSC Combined Course",
    "Railway Exam Training",
    "Police Exam Preparation",
  ];

  return (
    <div className={`max-w-2xl mx-auto ${className}`}>
      {/* Form Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        {/* Form Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-dark font-poppins mb-2">
            Government Course Registration
          </h2>
          <p className="text-gray-600">
            Fill in your details to register for the government course
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                id="fullName"
                {...register("fullName")}
                placeholder="Enter your full name"
                className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 text-gray-900 focus:text-orange-600 placeholder:text-gray-400 ${
                  errors.fullName ? "border-danger focus:ring-danger/20" : "border-gray-300"
                }`}
              />
              {errors.fullName && (
                <div className="flex items-center gap-2 mt-1">
                  <AlertCircle className="w-4 h-4 text-danger flex-shrink-0" />
                  <span className="text-danger text-sm">{errors.fullName.message}</span>
                </div>
              )}
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                id="phoneNumber"
                {...register("phoneNumber")}
                placeholder="01XXXXXXXXX"
                maxLength={11}
                className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 text-gray-900 focus:text-orange-600 placeholder:text-gray-400 ${
                  errors.phoneNumber ? "border-danger focus:ring-danger/20" : "border-gray-300"
                }`}
              />
              {errors.phoneNumber && (
                <div className="flex items-center gap-2 mt-1">
                  <AlertCircle className="w-4 h-4 text-danger flex-shrink-0" />
                  <span className="text-danger text-sm">{errors.phoneNumber.message}</span>
                </div>
              )}
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                id="email"
                {...register("email")}
                placeholder="your.email@example.com"
                className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 text-gray-900 focus:text-orange-600 placeholder:text-gray-400 ${
                  errors.email ? "border-danger focus:ring-danger/20" : "border-gray-300"
                }`}
              />
              {errors.email && (
                <div className="flex items-center gap-2 mt-1">
                  <AlertCircle className="w-4 h-4 text-danger flex-shrink-0" />
                  <span className="text-danger text-sm">{errors.email.message}</span>
                </div>
              )}
            </div>
          </div>

          {/* Address */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
              Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <textarea
                id="address"
                {...register("address")}
                placeholder="Enter your complete address"
                rows={3}
                className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 resize-none text-gray-900 focus:text-orange-600 placeholder:text-gray-400 ${
                  errors.address ? "border-danger focus:ring-danger/20" : "border-gray-300"
                }`}
              />
              {errors.address && (
                <div className="flex items-center gap-2 mt-1">
                  <AlertCircle className="w-4 h-4 text-danger flex-shrink-0" />
                  <span className="text-danger text-sm">{errors.address.message}</span>
                </div>
              )}
            </div>
          </div>

          {/* Course Name */}
          <div>
            <label htmlFor="courseName" className="block text-sm font-medium text-gray-700 mb-2">
              Course Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                id="courseName"
                {...register("courseName")}
                className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 appearance-none text-gray-900 focus:text-orange-600 ${
                  errors.courseName ? "border-danger focus:ring-danger/20" : "border-gray-300"
                }`}
              >
                <option value="">Select a government course</option>
                {governmentCourses.map((course) => (
                  <option key={course} value={course}>{course}</option>
                ))}
              </select>
              {errors.courseName && (
                <div className="flex items-center gap-2 mt-1">
                  <AlertCircle className="w-4 h-4 text-danger flex-shrink-0" />
                  <span className="text-danger text-sm">{errors.courseName.message}</span>
                </div>
              )}
            </div>
          </div>

          {/* Education Level */}
          <div>
            <label htmlFor="educationLevel" className="block text-sm font-medium text-gray-700 mb-2">
              Education Level <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                id="educationLevel"
                {...register("educationLevel")}
                className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 appearance-none text-gray-900 focus:text-orange-600 ${
                  errors.educationLevel ? "border-danger focus:ring-danger/20" : "border-gray-300"
                }`}
              >
                <option value="">Select your education level</option>
                {educationLevels.map((level) => (
                  <option key={level.value} value={level.value}>{level.label}</option>
                ))}
              </select>
              {errors.educationLevel && (
                <div className="flex items-center gap-2 mt-1">
                  <AlertCircle className="w-4 h-4 text-danger flex-shrink-0" />
                  <span className="text-danger text-sm">{errors.educationLevel.message}</span>
                </div>
              )}
            </div>
          </div>

          {/* Why Join */}
          <div>
            <label htmlFor="whyJoin" className="block text-sm font-medium text-gray-700 mb-2">
              Why do you want to join this course? <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Target className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <textarea
                id="whyJoin"
                {...register("whyJoin")}
                placeholder="Tell us why you want to join this government course..."
                rows={4}
                className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 resize-none text-gray-900 focus:text-orange-600 placeholder:text-gray-400 ${
                  errors.whyJoin ? "border-danger focus:ring-danger/20" : "border-gray-300"
                }`}
              />
              {errors.whyJoin && (
                <div className="flex items-center gap-2 mt-1">
                  <AlertCircle className="w-4 h-4 text-danger flex-shrink-0" />
                  <span className="text-danger text-sm">{errors.whyJoin.message}</span>
                </div>
              )}
            </div>
          </div>

          {/* Terms Checkbox */}
          <div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                {...register("agreeToTerms")}
                className="w-5 h-5 text-primary border-2 rounded focus:ring-2 focus:ring-primary/20 focus:outline-none"
              />
              <span className="text-sm text-gray-700">
                I agree to the{" "}
                <a href="#" className="text-primary hover:text-primary/80 underline">
                  Terms and Conditions
                </a>
                {" "}and{" "}
                <a href="#" className="text-primary hover:text-primary/80 underline">
                  Privacy Policy
                </a>
              </span>
              {errors.agreeToTerms && (
                <div className="flex items-center gap-2 mt-1">
                  <AlertCircle className="w-4 h-4 text-danger flex-shrink-0" />
                  <span className="text-danger text-sm">{errors.agreeToTerms.message}</span>
                </div>
              )}
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full btn-primary group ${
              isSubmitting ? "opacity-75 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent border-b-transparent animate-spin rounded-full"></div>
                Processing...
              </>
            ) : (
              <>
                Register Now
                <GraduationCap className="inline-block ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default GovtRegistrationForm;
