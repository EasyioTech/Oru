import { useState } from "react";
import { ArrowLeft, Check, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/layout/PageHeader";
import { useCreateEmployee } from "./hooks/useCreateEmployee";
import {
  CredentialsSuccessCard, DocumentUploadSection,
  ProfilePhotoCard, PersonalInfoCard, EmploymentDetailsCard,
} from "./components";

export default function CreateEmployee() {
  const {
    form, user, profile, isSubmitting, onSubmit,
    uploadedFiles, handleFileUpload, removeFile,
    profileImage, profileImagePreview, handleProfileImageUpload, removeProfileImage,
    generatedEmployeeId, onRegenerateId,
    dateOfBirthOpen, setDateOfBirthOpen, dateOfBirthInput, setDateOfBirthInput,
    hireDateOpen, setHireDateOpen, hireDateInput, setHireDateInput,
    companyDomain, generateWorkEmail,
    departments, roles, employmentTypes, loadingOptions,
    createdCredentials, copiedCreds, credentialsText,
    copyCredentials, downloadCredentials, dismissCredentials,
  } = useCreateEmployee();

  const createdByName = profile?.full_name || user?.email || "Unknown";

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const steps = [
    { id: 1, title: "Personal Info" },
    { id: 2, title: "Employment" },
    { id: 3, title: "Additional Details" },
  ];

  const handleNext = async () => {
    let fieldsToValidate: string[] = [];
    if (currentStep === 1) {
      fieldsToValidate = ['firstName', 'lastName', 'email', 'phone', 'dateOfBirth'];
    } else if (currentStep === 2) {
      fieldsToValidate = ['department', 'position', 'employeeId', 'hireDate', 'employmentType', 'salary'];
    }

    const isValid = await form.trigger(fieldsToValidate as any);
    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024, sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl animate-in fade-in duration-500">
      <div className="mb-2">
        <Link to="/employees" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />Back to Employees
        </Link>
      </div>
      <PageHeader
        title="Create New Employee"
        description="Add a new employee to the system"
      />

      {createdCredentials && (
        <CredentialsSuccessCard
          credentialsText={credentialsText}
          copiedCreds={copiedCreds}
          onCopy={copyCredentials}
          onDownload={downloadCredentials}
          onDismiss={dismissCredentials}
        />
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="pb-24">
          
          {/* Shadcn Tabs as Progress Bar */}
          <div className="mb-8 max-w-3xl mx-auto">
            <Tabs value={currentStep.toString()} className="w-full">
              <TabsList className="grid w-full grid-cols-3 h-12">
                {steps.map((step) => (
                  <TabsTrigger 
                    key={step.id} 
                    value={step.id.toString()}
                    disabled={true}
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm"
                  >
                    {step.id < currentStep && <Check className="w-4 h-4 mr-2" />}
                    {step.title}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          <div>
            {currentStep === 1 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500 max-w-4xl mx-auto">
                <PersonalInfoCard
                  form={form}
                  companyDomain={companyDomain}
                  generateWorkEmail={generateWorkEmail}
                  dateOfBirthOpen={dateOfBirthOpen}
                  setDateOfBirthOpen={setDateOfBirthOpen}
                  dateOfBirthInput={dateOfBirthInput}
                  setDateOfBirthInput={setDateOfBirthInput}
                />
              </div>
            )}

            {currentStep === 2 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <EmploymentDetailsCard
                  form={form}
                  departments={departments}
                  employmentTypes={employmentTypes}
                  loadingOptions={loadingOptions}
                  generatedEmployeeId={generatedEmployeeId}
                  onRegenerateId={onRegenerateId}
                  hireDateOpen={hireDateOpen}
                  setHireDateOpen={setHireDateOpen}
                  hireDateInput={hireDateInput}
                  setHireDateInput={setHireDateInput}
                  createdByName={createdByName}
                />
              </div>
            )}

            {currentStep === 3 && (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-6">
                  <ProfilePhotoCard
                    profileImage={profileImage}
                    profileImagePreview={profileImagePreview}
                    onUpload={handleProfileImageUpload}
                    onRemove={removeProfileImage}
                  />
                </div>
                <div className="space-y-6">
                  <DocumentUploadSection
                    uploadedFiles={uploadedFiles}
                    onFileUpload={handleFileUpload}
                    onRemoveFile={removeFile}
                    formatFileSize={formatFileSize}
                  />
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Additional Notes</CardTitle>
                      <CardDescription>Any additional information about the employee</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <FormField control={form.control} name="notes" render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea placeholder="Add any additional notes or comments about the employee..." className="min-h-[120px]" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>

          {/* Fixed Bottom Action Bar */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t z-50 md:left-[var(--sidebar-width)] transition-all duration-300">
            <div className="max-w-5xl mx-auto flex items-center justify-between px-4 lg:px-8">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={currentStep === 1 || isSubmitting}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${currentStep === 1 ? 'opacity-0 pointer-events-none' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
              >
                Previous Step
              </button>
              
              <div className="flex items-center gap-3">
                {currentStep < totalSteps ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-md font-medium text-sm hover:bg-primary/90 transition-colors shadow-sm"
                  >
                    Next Step <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-8 py-2.5 rounded-md font-medium text-sm hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-r-transparent" />
                        Saving...
                      </span>
                    ) : (
                      "Create Employee"
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
