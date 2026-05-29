# FireZone eSports Security Specification

## Data Invariants
1. A user cannot join a match without paying the entry fee (deducted from balance).
2. Only admins can approve payments and update user balances.
3. Only admins can create/update matches and input results.
4. Users can only see their own private notifications and payment history.
5. User balances cannot be modified by the users themselves.

## The Dirty Dozen Payloads
1. **Unauthorized Balance Boost**: A user trying to update their own `balance` field to 1,000,000.
   - Result: `PERMISSION_DENIED`
2. **Match Slot Injection**: A user trying to create a `Match` document to host their own fake tournament.
   - Result: `PERMISSION_DENIED`
3. **Ghost Payment Approval**: A user trying to update their `Payment` status from `pending` to `approved`.
   - Result: `PERMISSION_DENIED`
4. **Room ID Leakage**: A user trying to `get` the `Match` document and see `roomId`/`roomPassword` before joining.
   - *Wait, I should hide these fields for non-joined users.*
5. **Double Spend**: Submitting two registrations for the same match with the same transaction ID (handled by unique IDs/logic).
6. **Admin Spoofing**: A user trying to create a document in the `/admins/` collection.
   - Result: `PERMISSION_DENIED`
7. **Invalid Match Creation**: Creating a match with a negative entry fee.
   - Result: `PERMISSION_DENIED`
8. **Malicious Notification Spam**: A user trying to send a notification to another user.
   - Result: `PERMISSION_DENIED`
9. **Result Forgery**: A user trying to update their own `Result` to show 100 kills.
   - Result: `PERMISSION_DENIED`
10. **Huge ID Poisoning**: Trying to create a match with a 10KB ID string.
    - Result: `PERMISSION_DENIED`
11. **Email Spoofing check**: Trying to access admin features while having the correct email but `email_verified: false`.
    - Result: `PERMISSION_DENIED`
12. **Shadow Field Update**: Updating a match and adding a `hiddenAdmin: true` field.
    - Result: `PERMISSION_DENIED`

## Test Runner (Logic Check)
The rules will be verified using `npx firebase-rules-test` or similar if available, or just carefully audited via Phase 5.
