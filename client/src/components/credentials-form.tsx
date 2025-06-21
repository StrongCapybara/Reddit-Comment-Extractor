import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiRequest } from "@/lib/queryClient";
import { redditCredentialsSchema, type RedditCredentials } from "@shared/schema";

interface CredentialsFormProps {
  onSubmit: (credentials: RedditCredentials) => void;
  isCompleted: boolean;
}

export function CredentialsForm({ onSubmit, isCompleted }: CredentialsFormProps) {
  const [showSecret, setShowSecret] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<RedditCredentials>({
    resolver: zodResolver(redditCredentialsSchema),
  });

  const validateMutation = useMutation({
    mutationFn: async (credentials: RedditCredentials) => {
      const response = await apiRequest("POST", "/api/validate-credentials", credentials);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.valid) {
        const credentials = getValues();
        onSubmit(credentials);
      }
    },
  });

  const handleFormSubmit = (data: RedditCredentials) => {
    validateMutation.mutate(data);
  };

  if (isCompleted) {
    return (
      <section className="mb-12">
        <div className="bg-surface rounded-2xl p-8 border border-surface-variant">
          <div className="flex items-start space-x-4">
            <div className="bg-emerald-500/10 p-3 rounded-xl">
              <i className="fas fa-check text-emerald-500 text-xl"></i>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-50 mb-2">Credentials Verified ✓</h2>
              <p className="text-slate-300">Your Reddit API credentials have been validated successfully.</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-12">
      <div className="bg-surface rounded-2xl p-8 border border-surface-variant">
        <div className="flex items-start space-x-4 mb-6">
          <div className="bg-secondary/10 p-3 rounded-xl">
            <i className="fas fa-user-lock text-secondary text-xl"></i>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-50 mb-2">Step 2: Enter Your Credentials</h2>
            <p className="text-slate-300">Enter your Reddit API credentials and username below</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="clientId" className="text-slate-300">Client ID</Label>
              <div className="relative">
                <Input
                  id="clientId"
                  {...register("clientId")}
                  placeholder="14-character string from Reddit app"
                  className="bg-slate-800 border-slate-600 text-slate-50 placeholder-slate-400 pr-10"
                />
                <i className="fas fa-key absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400"></i>
              </div>
              {errors.clientId && (
                <p className="text-sm text-red-400">{errors.clientId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientSecret" className="text-slate-300">Client Secret</Label>
              <div className="relative">
                <Input
                  id="clientSecret"
                  type={showSecret ? "text" : "password"}
                  {...register("clientSecret")}
                  placeholder="Secret key from Reddit app"
                  className="bg-slate-800 border-slate-600 text-slate-50 placeholder-slate-400 pr-10"
                />
                <i 
                  className={`fas ${showSecret ? 'fa-eye-slash' : 'fa-eye'} cursor-pointer absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300`}
                  onClick={() => setShowSecret(!showSecret)}
                ></i>
              </div>
              {errors.clientSecret && (
                <p className="text-sm text-red-400">{errors.clientSecret.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username" className="text-slate-300">Reddit Username</Label>
            <div className="relative">
              <Input
                id="username"
                {...register("username")}
                placeholder="Your Reddit username (without u/)"
                className="bg-slate-800 border-slate-600 text-slate-50 placeholder-slate-400 pr-10"
              />
              <i className="fas fa-user absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400"></i>
            </div>
            {errors.username && (
              <p className="text-sm text-red-400">{errors.username.message}</p>
            )}
          </div>

          <Alert className="border-blue-700/50 bg-blue-900/20">
            <i className="fas fa-info-circle text-blue-400"></i>
            <AlertDescription className="text-blue-300">
              <strong className="text-blue-400">Security Note:</strong> Your credentials are only used locally in your browser and are never sent to our servers. They're stored temporarily to make API calls directly to Reddit.
            </AlertDescription>
          </Alert>

          {validateMutation.error && (
            <Alert className="border-red-700/50 bg-red-900/20">
              <i className="fas fa-exclamation-triangle text-red-400"></i>
              <AlertDescription className="text-red-300">
                {validateMutation.error instanceof Error ? validateMutation.error.message : "Failed to validate credentials"}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={validateMutation.isPending}
              className="bg-primary hover:bg-blue-600"
            >
              {validateMutation.isPending ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Validating...
                </>
              ) : (
                <>
                  <i className="fas fa-check mr-2"></i>
                  Validate & Continue
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
