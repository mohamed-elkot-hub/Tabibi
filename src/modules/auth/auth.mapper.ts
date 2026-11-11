export function toPublicUser(user: any) {
  return {
    id: String(user._id),
    name: user.name as string,
    email: user.email as string,
    phone: user.phone as string | undefined,
    role: user.role as 'PATIENT' | 'DOCTOR' | 'ADMIN',
    ...(user.role === 'DOCTOR' && {
      specialty: user.specialty as string,
      verificationStatus: user.verificationStatus as string,
    }),
  };
}

export type PublicUser = ReturnType<typeof toPublicUser>;