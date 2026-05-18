"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Phone, Mail, MapPin, CreditCard, CheckCircle, AlertCircle } from "lucide-react";

// Validation schema
const registrationSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(50, "Full name must not exceed 50 characters"),
  phoneNumber: z.string().regex(/^01[3-9]\d{8}$/, "Phone number must be a valid 11-digit number starting with 01"),
  email: z.string().email("Please enter a valid email address"),
  address: z.string().min(10, "Address must be at least 10 characters").max(200, "Address must not exceed 200 characters"),
  courseName: z.string().min(1, "Please select a course"),
  paymentMethod: z.enum(["bkash", "nagad", "bank"], "Please select a payment method"),
  transactionId: z.string().min(4, "Transaction ID must be at least 4 characters").max(50, "Transaction ID must not exceed 50 characters"),
  agreeToTerms: z.boolean().refine((val) => val === true, "You must agree to the terms and conditions"),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

interface RegistrationFormProps {
  courseName?: string;
  onSuccess?: (data: RegistrationFormData) => void;
  className?: string;
}

const RegistrationForm = ({ courseName = "", onSuccess, className = "" }: RegistrationFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, touchedFields },
    reset,
    setValue
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
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

  const onSubmit = async (data: RegistrationFormData) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log("Registration Form Data:", data);
      
      // Show success message
      setSubmitSuccess(true);
      
      // Call success callback
      if (onSuccess) {
        onSuccess(data);
      }
      
      // Reset form after 2 seconds
      setTimeout(() => {
        reset();
        setSubmitSuccess(false);
      }, 2000);
    } catch (error) {
      console.error("Registration error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const paymentMethods = [
    { value: "bkash", label: "bKash", icon: "ব" },
    { value: "nagad", label: "Nagad", icon: "নগ" },
    { value: "bank", label: "Bank Transfer", icon: "🏦" },
  ];

  return (
    <div className={`max-w-2xl mx-auto ${className}`}>
      {/* Success Message */}
      {submitSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-green-800">Registration Successful!</h4>
            <p className="text-green-600 text-sm">We'll contact you soon with further details.</p>
          </div>
        </div>
      )}

      {/* Form Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        {/* Form Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-dark font-poppins mb-2">
            Course Registration
          </h2>
          <p className="text-gray-600">
            Fill in your details to register for the course
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
              <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                id="courseName"
                {...register("courseName")}
                className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 appearance-none text-gray-900 focus:text-orange-600 ${
                  errors.courseName ? "border-danger focus:ring-danger/20" : "border-gray-300"
                }`}
              >
                <option value="">Select a course</option>
                <option value="Government Job Preparation">Government Job Preparation</option>
                <option value="Civil Services Foundation">Civil Services Foundation</option>
                <option value="Banking Exam Preparation">Banking Exam Preparation</option>
                <option value="SSC Combined Course">SSC Combined Course</option>
                <option value="Railway Exam Training">Railway Exam Training</option>
                <option value="Police Exam Preparation">Police Exam Preparation</option>
                <option value="Full Stack Web Development">Full Stack Web Development</option>
                <option value="Data Science & Machine Learning">Data Science & Machine Learning</option>
                <option value="Mobile App Development">Mobile App Development</option>
                <option value="Cloud Computing with AWS">Cloud Computing with AWS</option>
                <option value="Digital Marketing Mastery">Digital Marketing Mastery</option>
                <option value="UI/UX Design Fundamentals">UI/UX Design Fundamentals</option>
                <option value="Live Full Stack Bootcamp">Live Full Stack Bootcamp</option>
                <option value="Live Data Science Bootcamp">Live Data Science Bootcamp</option>
                <option value="Live Mobile Development">Live Mobile Development</option>
                <option value="Live DevOps Training">Live DevOps Training</option>
                <option value="Live UI/UX Design">Live UI/UX Design</option>
                <option value="Live Python Programming">Live Python Programming</option>
                <option value="Classroom Full Stack Training">Classroom Full Stack Training</option>
                <option value="Data Science Lab Training">Data Science Lab Training</option>
                <option value="Mobile App Workshop">Mobile App Workshop</option>
                <option value="UI/UX Design Studio">UI/UX Design Studio</option>
                <option value="DevOps Practical Training">DevOps Practical Training</option>
                <option value="Python Programming Lab">Python Programming Lab</option>
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
                Register Now
                <User className="inline-block ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;
