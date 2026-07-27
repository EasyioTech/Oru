import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, FileText, AlertCircle } from 'lucide-react';
import { useCreateClient } from './hooks/useCreateClient';
import { BasicInfoFields } from './components/BasicInfoFields';
import { ContactPersonFields } from './components/ContactPersonFields';
import { AddressFields } from './components/AddressFields';
import { BillingFields } from './components/BillingFields';
import { ClientFormSidebar } from './components/ClientFormSidebar';

const CreateClient: React.FC = () => {
  const navigate = useNavigate();
  const { formData, errors, loading, loadingClient, hasDraft, isEditing, creatorInfo, updaterInfo, profile, user, clearDraft, handleSubmit, handleInputChange } = useCreateClient();

  if (loadingClient) {
    return (
      <div className="container max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading client data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/clients')} className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{isEditing ? 'Edit Client' : 'Create New Client'}</h1>
            <p className="text-muted-foreground">
              {isEditing ? 'Update client information and details' : 'Add a new client to your database. All fields are automatically saved as draft.'}
            </p>
          </div>
        </div>
        {hasDraft && !isEditing && <Button variant="outline" onClick={clearDraft}>Clear Draft</Button>}
      </div>

      {hasDraft && !isEditing && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>You have a saved draft. Your changes are automatically saved as you type.</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <BasicInfoFields formData={formData} errors={errors} onChange={handleInputChange} />
            <ContactPersonFields formData={formData} errors={errors} onChange={handleInputChange} />
            <AddressFields formData={formData} onChange={handleInputChange} />
            <BillingFields formData={formData} errors={errors} onChange={handleInputChange} />
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" />Additional Information</CardTitle>
                <CardDescription>Any additional notes or information about this client</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" value={formData.notes} onChange={e => handleInputChange('notes', e.target.value)} placeholder="Add any additional notes, special instructions, or important information about this client..." rows={6} />
                </div>
              </CardContent>
            </Card>
          </div>
          <ClientFormSidebar loading={loading} isEditing={isEditing} hasDraft={hasDraft} formData={formData} creatorInfo={creatorInfo} updaterInfo={updaterInfo} profile={profile} user={user} clearDraft={clearDraft} />
        </div>
      </form>
    </div>
  );
};

export default CreateClient;
