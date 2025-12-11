"use client";

import React, { useState } from "react";
import {
    Car,
    Bike,
    Upload,
    Camera,
    ShieldAlert,
    ChevronLeft,
    ChevronRight,
    CheckCircle2,
    FileText,
    User,
    Palette,
    Hash,
    Loader2,
    CreditCard as IdCard,
    UserCircle2,
    MapPin
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { useRouter, Link } from "@/lib/navigation";

type VehicleType = 'MOTO' | 'TAXI';
type Step = 1 | 2 | 3 | 4;
type OnboardingMode = 'EXISTING_USER' | 'NEW_DRIVER';

interface FormData {
    // Step 1: Vehicle Info
    vehicleType: VehicleType | null;
    brand: string;
    model: string;
    licensePlate: string;
    color: string;
    city: string;
    // Step 2: Documents
    driverLicenseFront: File | null;
    driverLicenseBack: File | null;
    carRegistration: File | null;
    insurance: File | null;
    // Step 3: Selfie (only for NEW_DRIVER)
    selfie: File | null;
}

interface DriverOnboardingFormProps {
    mode?: OnboardingMode;
    onComplete?: () => void;
}

export function DriverOnboardingForm({
    mode = 'NEW_DRIVER',
    onComplete
}: DriverOnboardingFormProps) {
    const t = useTranslations('Driver');
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState<Step>(1);
    const [formData, setFormData] = useState<FormData>({
        vehicleType: null,
        brand: "",
        model: "",
        licensePlate: "",
        color: "",
        city: "",
        driverLicenseFront: null,
        driverLicenseBack: null,
        carRegistration: null,
        insurance: null,
        selfie: null,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // For EXISTING_USER, selfie is not required
    const totalSteps = mode === 'EXISTING_USER' ? 3 : 4;
    const progress = (currentStep / totalSteps) * 100;

    const handleInputChange = (field: keyof FormData, value: string | VehicleType) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleFileChange = (field: keyof FormData, file: File | null) => {
        setFormData(prev => ({ ...prev, [field]: file }));
    };

    const canProceedStep1 = formData.vehicleType && formData.brand && formData.model &&
        formData.licensePlate && formData.color;
    const canProceedStep2 = formData.driverLicenseFront && formData.driverLicenseBack &&
        formData.carRegistration;
    const canProceedStep3 = mode === 'EXISTING_USER' ? true : formData.selfie;

    const handleNext = () => {
        if (currentStep < totalSteps) {
            setCurrentStep((currentStep + 1) as Step);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep((currentStep - 1) as Step);
        }
    };

    const handleSubmit = () => {
        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            if (onComplete) {
                onComplete();
            } else {
                // Redirect to pending verification page
                router.push('/driver-pending');
            }
        }, 2000);
    };

    const shouldShowPending = currentStep === 4 && mode === 'NEW_DRIVER';

    return (
        <div className="h-screen overflow-y-auto bg-black text-white">
            {/* Progress Bar */}
            <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-[#1A1A1A]">
                <div className="h-1 bg-[#1A1A1A]">
                    <motion.div
                        className="h-full bg-[#F0B90B]"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
                <div className="px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {!shouldShowPending && (
                            <button
                                onClick={handleBack}
                                className={cn(
                                    "text-[#9A9A9A] hover:text-white transition-colors",
                                    currentStep === 1 && "invisible"
                                )}
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                        )}
                        <div>
                            <h1 className="text-xl font-heading font-bold">
                                {mode === 'EXISTING_USER' ? t('becomeDriver') : t('driverVerification')}
                            </h1>
                            <p className="text-xs text-[#9A9A9A]">
                                {shouldShowPending
                                    ? t('statusCompleted') || "Terminé"
                                    : t('step', { current: currentStep, total: totalSteps })
                                }
                            </p>
                        </div>
                    </div>
                    {!shouldShowPending && (
                        <div className="text-sm font-bold text-[#F0B90B]">
                            {Math.round(progress)}%
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="p-4 pb-32 max-w-2xl mx-auto">
                <AnimatePresence mode="wait">
                    {currentStep === 1 && (
                        <StepVehicleInfo
                            key="step1"
                            formData={formData}
                            onChange={handleInputChange}
                            mode={mode}
                        />
                    )}

                    {currentStep === 2 && (
                        <StepDocuments
                            key="step2"
                            formData={formData}
                            onFileChange={handleFileChange}
                            mode={mode}
                        />
                    )}

                    {currentStep === 3 && mode === 'NEW_DRIVER' && (
                        <StepSelfie
                            key="step3"
                            formData={formData}
                            onFileChange={handleFileChange}
                        />
                    )}

                    {currentStep === 3 && mode === 'EXISTING_USER' && (
                        <StepValidation
                            key="validation"
                            formData={formData}
                        />
                    )}

                    {shouldShowPending && (
                        <StepPending key="step4" />
                    )}
                </AnimatePresence>

                {/* Navigation Buttons */}
                {!shouldShowPending && (
                    <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-md border-t border-[#1A1A1A] p-4">
                        <div className="max-w-2xl mx-auto">
                            {(currentStep < 2 || (currentStep === 2 && mode === 'EXISTING_USER')) ? (
                                <Button
                                    onClick={() => {
                                        if (currentStep === 2 && mode === 'EXISTING_USER') {
                                            setCurrentStep(3);
                                        } else {
                                            handleNext();
                                        }
                                    }}
                                    disabled={
                                        (currentStep === 1 && !canProceedStep1) ||
                                        (currentStep === 2 && !canProceedStep2)
                                    }
                                    className="w-full h-14 bg-[#F0B90B] text-black hover:bg-[#F0B90B]/90 font-bold text-lg rounded-xl"
                                >
                                    {t('continue')}
                                    <ChevronRight className="w-5 h-5 ml-2" />
                                </Button>
                            ) : currentStep === 2 && mode === 'NEW_DRIVER' ? (
                                <Button
                                    onClick={handleNext}
                                    disabled={!canProceedStep2}
                                    className="w-full h-14 bg-[#F0B90B] text-black hover:bg-[#F0B90B]/90 font-bold text-lg rounded-xl"
                                >
                                    {t('continue')}
                                    <ChevronRight className="w-5 h-5 ml-2" />
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleSubmit}
                                    disabled={
                                        (mode === 'NEW_DRIVER' && !canProceedStep3) ||
                                        isSubmitting
                                    }
                                    className="w-full h-14 bg-[#F0B90B] text-black hover:bg-[#F0B90B]/90 font-bold text-lg rounded-xl"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                            {t('sending')}
                                        </>
                                    ) : (
                                        <>
                                            <ShieldAlert className="w-5 h-5 mr-2" />
                                            {mode === 'EXISTING_USER'
                                                ? t('submitApplication')
                                                : t('submitVerification')
                                            }
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// --- Step Components ---

function StepVehicleInfo({ formData, onChange, mode }: {
    formData: FormData;
    onChange: (field: keyof FormData, value: string | VehicleType) => void;
    mode: OnboardingMode;
}) {
    const t = useTranslations('Driver');

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#F0B90B]/10 border border-[#F0B90B]/20 flex items-center justify-center">
                    <Car className="w-6 h-6 text-[#F0B90B]" />
                </div>
                <div>
                    <h2 className="text-2xl font-heading font-bold">{t('yourVehicle')}</h2>
                    <p className="text-sm text-[#9A9A9A]">{t('vehicleDesc')}</p>
                </div>
            </div>

            {/* Vehicle Type Selector */}
            <div>
                <label className="text-sm font-bold text-white mb-3 block">
                    {t('vehicleType')}
                </label>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={() => onChange('vehicleType', 'MOTO')}
                        className={cn(
                            "h-24 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-2",
                            formData.vehicleType === 'MOTO'
                                ? "bg-[#F0B90B]/10 border-[#F0B90B] text-[#F0B90B]"
                                : "bg-[#0C0C0C] border-[#1A1A1A] text-[#9A9A9A] hover:border-[#333333]"
                        )}
                    >
                        <Bike className="w-8 h-8" />
                        <span className="font-bold text-sm">{t('motoTaxi')}</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => onChange('vehicleType', 'TAXI')}
                        className={cn(
                            "h-24 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-2",
                            formData.vehicleType === 'TAXI'
                                ? "bg-[#F0B90B]/10 border-[#F0B90B] text-[#F0B90B]"
                                : "bg-[#0C0C0C] border-[#1A1A1A] text-[#9A9A9A] hover:border-[#333333]"
                        )}
                    >
                        <Car className="w-8 h-8" />
                        <span className="font-bold text-sm">{t('carTaxi')}</span>
                    </button>
                </div>
            </div>

            {/* Brand & Model */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-sm font-medium text-[#9A9A9A] mb-2 block">
                        {t('brand')}
                    </label>
                    <Input
                        placeholder="Toyota, Honda..."
                        value={formData.brand}
                        onChange={(e) => onChange('brand', e.target.value)}
                        className="h-12 bg-[#0C0C0C] border-[#1A1A1A] text-white"
                    />
                </div>
                <div>
                    <label className="text-sm font-medium text-[#9A9A9A] mb-2 block">
                        {t('model')}
                    </label>
                    <Input
                        placeholder="Corolla, Civic..."
                        value={formData.model}
                        onChange={(e) => onChange('model', e.target.value)}
                        className="h-12 bg-[#0C0C0C] border-[#1A1A1A] text-white"
                    />
                </div>
            </div>

            {/* License Plate */}
            <div>
                <label className="text-sm font-medium text-[#9A9A9A] mb-2 block">
                    {t('plateNumber')}
                </label>
                <div className="relative">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9A9A9A]" />
                    <Input
                        placeholder="Ex: KV-1234-ABC"
                        value={formData.licensePlate}
                        onChange={(e) => onChange('licensePlate', e.target.value.toUpperCase())}
                        className="h-12 pl-12 bg-[#0C0C0C] border-[#1A1A1A] text-white font-mono tracking-wider"
                    />
                </div>
            </div>

            {/* Color */}
            <div>
                <label className="text-sm font-medium text-[#9A9A9A] mb-2 block">
                    {t('color')}
                </label>
                <div className="relative">
                    <Palette className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9A9A9A]" />
                    <Input
                        placeholder="Blanc, Noir, Bleu..."
                        value={formData.color}
                        onChange={(e) => onChange('color', e.target.value)}
                        className="h-12 pl-12 bg-[#0C0C0C] border-[#1A1A1A] text-white"
                    />
                </div>
            </div>

            {/* City - Only for EXISTING_USER */}
            {mode === 'EXISTING_USER' && (
                <div>
                    <label className="text-sm font-medium text-[#9A9A9A] mb-2 block">
                        {t('city')}
                    </label>
                    <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9A9A9A] pointer-events-none" />
                        <select
                            value={formData.city}
                            onChange={(e) => onChange('city', e.target.value)}
                            className="h-12 w-full pl-12 pr-4 bg-[#0C0C0C] border border-[#1A1A1A] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F0B90B]/50 appearance-none cursor-pointer"
                        >
                            <option value="" disabled className="bg-[#0C0C0C] text-[#666]">
                                {t('selectCity')}
                            </option>
                            <option value="goma" className="bg-[#0C0C0C]">Goma</option>
                            <option value="bukavu" className="bg-[#0C0C0C]">Bukavu</option>
                            <option value="kinshasa" className="bg-[#0C0C0C]">Kinshasa</option>
                            <option value="lubumbashi" className="bg-[#0C0C0C]">Lubumbashi</option>
                        </select>
                    </div>
                </div>
            )}
        </motion.div>
    );
}

function StepDocuments({ formData, onFileChange, mode }: {
    formData: FormData;
    onFileChange: (field: keyof FormData, file: File | null) => void;
    mode: OnboardingMode;
}) {
    const t = useTranslations('Driver');

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#F0B90B]/10 border border-[#F0B90B]/20 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-[#F0B90B]" />
                </div>
                <div>
                    <h2 className="text-2xl font-heading font-bold">{t('requiredDocs')}</h2>
                    <p className="text-sm text-[#9A9A9A]">{t('docsDesc')}</p>
                </div>
            </div>

            <DocumentUpload
                label={t('drivingLicenseFront')}
                required
                file={formData.driverLicenseFront}
                onFileChange={(file) => onFileChange('driverLicenseFront', file)}
            />

            <DocumentUpload
                label={t('drivingLicenseBack')}
                required
                file={formData.driverLicenseBack}
                onFileChange={(file) => onFileChange('driverLicenseBack', file)}
            />

            <DocumentUpload
                label={t('carRegistration')}
                required
                file={formData.carRegistration}
                onFileChange={(file) => onFileChange('carRegistration', file)}
            />

            {mode === 'EXISTING_USER' && (
                <DocumentUpload
                    label={t('idPhoto')}
                    required
                    file={formData.insurance}
                    onFileChange={(file) => onFileChange('insurance', file)}
                />
            )}

            {mode === 'NEW_DRIVER' && (
                <DocumentUpload
                    label={t('insurance')}
                    required={false}
                    file={formData.insurance}
                    onFileChange={(file) => onFileChange('insurance', file)}
                />
            )}

            <Card className="bg-[#1A1A1A]/50 border-[#333333]">
                <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                        <ShieldAlert className="w-5 h-5 text-[#F0B90B] flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-[#9A9A9A] leading-relaxed">
                            {t('driverNotice', { fallback: 'Vos documents seront vérifiés par nos équipes et les autorités locales.' })}
                        </p>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

function DocumentUpload({ label, required, file, onFileChange }: {
    label: string;
    required: boolean;
    file: File | null;
    onFileChange: (file: File | null) => void;
}) {
    const t = useTranslations('Driver');

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0] || null;
        onFileChange(selectedFile);
    };

    return (
        <div>
            <label className="text-sm font-medium text-white mb-2 block">
                {label} {required && <span className="text-[#F0B90B]">*</span>}
            </label>
            <label
                className={cn(
                    "flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all",
                    file
                        ? "bg-[#F0B90B]/10 border-[#F0B90B]/30"
                        : "bg-[#0C0C0C] border-[#333333] hover:border-[#F0B90B]/50 hover:bg-[#1A1A1A]"
                )}
            >
                <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                />
                {file ? (
                    <div className="flex flex-col items-center gap-2">
                        <CheckCircle2 className="w-8 h-8 text-[#F0B90B]" />
                        <span className="text-sm font-medium text-white text-center px-4">{file.name}</span>
                        <span className="text-xs text-[#9A9A9A]">
                            {(file.size / 1024).toFixed(2)} KB
                        </span>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2">
                        <Upload className="w-8 h-8 text-[#9A9A9A]" />
                        <span className="text-sm text-[#9A9A9A]">{t('clickToUpload')}</span>
                    </div>
                )}
            </label>
        </div>
    );
}

function StepSelfie({ formData, onFileChange }: {
    formData: FormData;
    onFileChange: (field: keyof FormData, file: File | null) => void;
}) {
    const t = useTranslations('Driver');

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0] || null;
        onFileChange('selfie', selectedFile);
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#F0B90B]/10 border border-[#F0B90B]/20 flex items-center justify-center">
                    <Camera className="w-6 h-6 text-[#F0B90B]" />
                </div>
                <div>
                    <h2 className="text-2xl font-heading font-bold">{t('securityPhoto')}</h2>
                    <p className="text-sm text-[#9A9A9A]">{t('securityPhotoDesc')}</p>
                </div>
            </div>

            {/* Selfie Frame */}
            <div className="relative">
                <label
                    className={cn(
                        "flex flex-col items-center justify-center aspect-[3/4] rounded-2xl border-2 border-dashed cursor-pointer transition-all overflow-hidden",
                        formData.selfie
                            ? "bg-[#F0B90B]/10 border-[#F0B90B]/30"
                            : "bg-[#0C0C0C] border-[#333333]"
                    )}
                >
                    <input
                        type="file"
                        accept="image/*"
                        capture="user"
                        onChange={handleFileSelect}
                        className="hidden"
                    />

                    {formData.selfie ? (
                        <div className="flex flex-col items-center gap-4 p-6">
                            <CheckCircle2 className="w-16 h-16 text-[#F0B90B]" />
                            <div className="text-center">
                                <p className="text-lg font-bold text-white mb-1">{t('photoCaptured')} ✓</p>
                                <p className="text-sm text-[#9A9A9A]">{formData.selfie.name}</p>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                className="border-[#F0B90B] text-[#F0B90B] hover:bg-[#F0B90B]/10"
                                onClick={(e) => {
                                    e.preventDefault();
                                    onFileChange('selfie', null);
                                }}
                            >
                                {t('retakePhoto')}
                            </Button>
                        </div>
                    ) : (
                        <>
                            {/* Oval Guide */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-48 h-64 border-4 border-[#F0B90B]/30 rounded-[50%] border-dashed animate-pulse" />
                            </div>

                            <div className="relative z-10 flex flex-col items-center gap-4">
                                <div className="w-20 h-20 rounded-full bg-[#F0B90B]/10 flex items-center justify-center">
                                    <Camera className="w-10 h-10 text-[#F0B90B]" />
                                </div>
                                <div className="text-center px-6">
                                    <p className="text-lg font-bold text-white mb-2">
                                        {t('takeSelfie')}
                                    </p>
                                    <p className="text-sm text-[#9A9A9A] leading-relaxed">
                                        {t('selfieDesc')}
                                    </p>
                                </div>
                            </div>
                        </>
                    )}
                </label>
            </div>

            <Card className="bg-[#1A1A1A]/50 border-[#333333]">
                <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                        <User className="w-5 h-5 text-[#F0B90B] flex-shrink-0 mt-0.5" />
                        <div className="text-xs text-[#9A9A9A] leading-relaxed space-y-2">
                            <p className="font-bold text-white">Conseils pour une bonne photo :</p>
                            <ul className="space-y-1 list-disc list-inside">
                                <li>Assurez-vous d&apos;être dans un endroit bien éclairé</li>
                                <li>Retirez lunettes de soleil et casquettes</li>
                                <li>Regardez directement la caméra</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

function StepValidation({ formData }: { formData: FormData }) {
    const t = useTranslations('Driver');

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#F0B90B]/10 border border-[#F0B90B]/20 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-[#F0B90B]" />
                </div>
                <div>
                    <h2 className="text-2xl font-heading font-bold">{t('finalVerification')}</h2>
                    <p className="text-sm text-[#9A9A9A]">{t('verifyInfo')}</p>
                </div>
            </div>

            {/* Vehicle Info Summary */}
            <Card className="bg-[#0C0C0C] border-[#1A1A1A]">
                <CardContent className="p-4">
                    <h3 className="text-sm font-bold text-[#F0B90B] mb-3 uppercase tracking-wide">
                        {t('vehicleInfo')}
                    </h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-[#9A9A9A]">{t('vehicleType')}:</span>
                            <span className="text-white font-medium">
                                {formData.vehicleType === 'MOTO' ? t('motoTaxi') : t('carTaxi')}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[#9A9A9A]">{t('brand')}:</span>
                            <span className="text-white font-medium">{formData.brand}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[#9A9A9A]">{t('model')}:</span>
                            <span className="text-white font-medium">{formData.model}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[#9A9A9A]">{t('plateNumber')}:</span>
                            <span className="text-white font-medium font-mono">{formData.licensePlate}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[#9A9A9A]">{t('color')}:</span>
                            <span className="text-white font-medium">{formData.color}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Documents Summary */}
            <Card className="bg-[#0C0C0C] border-[#1A1A1A]">
                <CardContent className="p-4">
                    <h3 className="text-sm font-bold text-[#F0B90B] mb-3 uppercase tracking-wide">
                        {t('documentsProvided')}
                    </h3>
                    <div className="space-y-2">
                        <DocumentCheck label={t('drivingLicenseFront')} uploaded={!!formData.driverLicenseFront} />
                        <DocumentCheck label={t('drivingLicenseBack')} uploaded={!!formData.driverLicenseBack} />
                        <DocumentCheck label={t('carRegistration')} uploaded={!!formData.carRegistration} />
                        <DocumentCheck label={t('idPhoto')} uploaded={!!formData.insurance} />
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[#F0B90B]/10 to-transparent border-[#F0B90B]/20">
                <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                        <ShieldAlert className="w-5 h-5 text-[#F0B90B] flex-shrink-0 mt-0.5" />
                        <div className="text-xs text-[#9A9A9A] leading-relaxed">
                            {t('driverNotice', { fallback: 'En soumettant cette candidature, vous acceptez que vos documents soient vérifiés.' })}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

function DocumentCheck({ label, uploaded }: { label: string; uploaded: boolean }) {
    return (
        <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className={cn(
                "w-4 h-4",
                uploaded ? "text-green-500" : "text-[#333333]"
            )} />
            <span className={uploaded ? "text-white" : "text-[#9A9A9A]"}>{label}</span>
        </div>
    );
}

function StepPending() {
    const t = useTranslations('Driver');

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6"
        >
            {/* Animated Icon */}
            <div className="relative mb-8">
                <div className="w-32 h-32 rounded-full bg-[#F0B90B]/10 border-2 border-[#F0B90B]/30 flex items-center justify-center animate-pulse">
                    <ShieldAlert className="w-16 h-16 text-[#F0B90B]" />
                </div>
                <div className="absolute inset-0 rounded-full bg-[#F0B90B]/5 animate-ping" />
            </div>

            <h2 className="text-3xl font-heading font-bold mb-4">
                {t('pendingVerification')}
            </h2>

            <p className="text-[#9A9A9A] leading-relaxed mb-8 max-w-md">
                {t('pendingSubtitle')}
                <br />
                {t('notificationDesc')}
            </p>

            <Card className="bg-[#0C0C0C] border-[#1A1A1A] text-left max-w-md w-full mb-8">
                <CardContent className="p-6">
                    <h3 className="text-sm font-bold text-[#F0B90B] mb-4 uppercase tracking-wide">
                        {t('statusVerification')}
                    </h3>
                    <div className="space-y-3">
                        <TimelineItem
                            icon={<FileText className="w-4 h-4" />}
                            text={t('stepDocuments')}
                            time={t('statusInProgress')}
                            active
                        />
                        <TimelineItem
                            icon={<User className="w-4 h-4" />}
                            text={t('stepAuthorities')}
                            time="12-24h"
                        />
                        <TimelineItem
                            icon={<CheckCircle2 className="w-4 h-4" />}
                            text={t('stepActivation')}
                            time="24-48h"
                        />
                    </div>
                </CardContent>
            </Card>

            <Link href="/">
                <Button
                    className="w-full max-w-md h-14 bg-[#F0B90B] text-black hover:bg-[#F0B90B]/90 font-bold text-lg rounded-xl"
                >
                    {t('backToHome')}
                </Button>
            </Link>
        </motion.div>
    );
}

function TimelineItem({ icon, text, time, active }: {
    icon: React.ReactNode;
    text: string;
    time: string;
    active?: boolean;
}) {
    return (
        <div className="flex items-center gap-3">
            <div
                className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                    active ? "bg-[#F0B90B]/20 text-[#F0B90B]" : "bg-[#1A1A1A] text-[#9A9A9A]"
                )}
            >
                {icon}
            </div>
            <div className="flex-1">
                <p className={cn("text-sm font-medium", active ? "text-white" : "text-[#9A9A9A]")}>
                    {text}
                </p>
            </div>
            <span className="text-xs text-[#666]">{time}</span>
        </div>
    );
}
