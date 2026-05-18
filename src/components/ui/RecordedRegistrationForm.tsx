"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Phone, Mail, MapPin, CreditCard, CheckCircle, AlertCircle, PlayCircle } from "lucide-react";
import toast from 'react-hot-toast';

// Validation schema for Recorded Course Registration
const recordedRegistrationSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(50, "Full name must not exceed 50 characters"),
  phoneNumber: z.string().regex(/^01[3-9]\d{8}$/, "Phone number must be a valid 11-digit number starting with 01"),
  email: z.string().email("Please enter a valid email address"),
  address: z.string().min(10, "Address must be at least 10 characters").max(200, "Address must not exceed 200 characters"),
  courseName: z.string().min(1, "Please select a course"),
  paymentMethod: z.enum(["bkash", "nagad", "bank"], "Please select a payment method"),
  transactionId: z.string().min(4, "Transaction ID must be at least 4 characters").max(50, "Transaction ID must not exceed 50 characters"),
  agreeToTerms: z.boolean().refine((val) => val === true, "You must agree to the terms and conditions"),
});

type RecordedRegistrationFormData = z.infer<typeof recordedRegistrationSchema>;

interface RecordedRegistrationFormProps {
  courseName?: string;
  onSuccess?: (data: RecordedRegistrationFormData) => void;
  className?: string;
}

const RecordedRegistrationForm = ({ courseName = "", onSuccess, className = "" }: RecordedRegistrationFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, touchedFields },
    reset,
    setValue
  } = useForm<RecordedRegistrationFormData>({
    resolver: zodResolver(recordedRegistrationSchema),
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      email: "",
      address: "",
      courseName: courseName,
      paymentMethod: "bkash",
      transactionId: "",
      agreeToTerms: false,
    },
  });

  const onSubmit = async (data: RecordedRegistrationFormData) => {
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
          category: 'RECORDED'
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

  const paymentMethods = [
    { value: "bkash", label: "bKash", icon: "ব" },
    { value: "nagad", label: "Nagad", icon: "নগ" },
    { value: "bank", label: "Bank Transfer", icon: "🏦" },
  ];

  const recordedCourses = [
    "Data Science & Machine Learning",
    "Full Stack Web Development",
    "Mobile App Development",
    "Cloud Computing with AWS",
    "Digital Marketing Mastery",
    "UI/UX Design Fundamentals",
    "Python Programming Lab",
    "DevOps Practical Training",
  ];

  return (
    <div className={`max-w-2xl mx-auto ${className}`}>
      {/* Form Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        {/* Form Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-dark font-poppins mb-2">
            Recorded Course Registration
          </h2>
          <p className="text-gray-600">
            Register now and get instant access to recorded course materials
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
              <PlayCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                id="courseName"
                {...register("courseName")}
                className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 appearance-none text-gray-900 focus:text-orange-600 ${
                  errors.courseName ? "border-danger focus:ring-danger/20" : "border-gray-300"
                }`}
              >
                <option value="">Select a recorded course</option>
                {recordedCourses.map((course) => (
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

          {/* Payment Method */}
          <div>
            <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-4">
              {paymentMethods.map((method) => (
                <label
                  key={method.value}
                  className={`relative flex items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                    errors.paymentMethod?.message && errors.paymentMethod.message.includes(method.value)
                      ? "border-danger bg-red-50"
                      : touchedFields.paymentMethod && !errors.paymentMethod
                      ? "border-primary bg-primary/5"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <input
                    type="radio"
                    {...register("paymentMethod")}
                    value={method.value}
                    className="sr-only"
                  />
                  <div className="text-center">
                    <div className="text-2xl mb-1">{method.icon}</div>
                    <div className="text-sm font-medium text-gray-700">{method.label}</div>
                  </div>
                </label>
              ))}
            </div>
            {errors.paymentMethod && (
              <div className="flex items-center gap-2 mt-1">
                <AlertCircle className="w-4 h-4 text-danger flex-shrink-0" />
                <span className="text-danger text-sm">{errors.paymentMethod.message}</span>
              </div>
            )}
          </div>

          {/* Transaction ID */}
          <div>
            <label htmlFor="transactionId" className="block text-sm font-medium text-gray-700 mb-2">
              Transaction ID <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                id="transactionId"
                {...register("transactionId")}
                placeholder="Enter transaction ID"
                className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 text-gray-900 focus:text-orange-600 placeholder:text-gray-400 ${
                  errors.transactionId ? "border-danger focus:ring-danger/20" : "border-gray-300"
                }`}
              />
              {errors.transactionId && (
                <div className="flex items-center gap-2 mt-1">
                  <AlertCircle className="w-4 h-4 text-danger flex-shrink-0" />
                  <span className="text-danger text-sm">{errors.transactionId.message}</span>
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
                Register & Pay Now
                <PlayCircle className="inline-block ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RecordedRegistrationForm;
