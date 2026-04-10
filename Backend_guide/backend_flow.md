# Tutoring Platform MVP - Backend Logic Specification

**Project:** Online Tutoring Marketplace  
**Prepared by:** Pleasant (Backend Logic & API Infrastructure)  
**Date:** January 29, 2026  
**Version:** 1.0 MVP

## Executive Summary

This document outlines the backend logic for our online tutoring platform MVP. The platform connects parents with verified tutors and handles all payments through a secure escrow system. Parents pay us upfront, we hold the funds until the session is successfully completed, and then we transfer payment to the tutor.

This specification covers the four core components requested: backend logic flow, data field definitions, session logging requirements, and payment status management. These foundations will guide our initial manual operations and prepare us for future automation.

## Table of Contents

1. Backend Logic
2. Data Fields Definition
3. Session Logs
4. Payment Status Management
5. Key Decisions for Implementation

---

## 1. BACKEND LOGIC

### Overview

Our platform operates as a trusted intermediary between parents seeking tutoring services and qualified tutors. We handle the entire transaction lifecycle from discovery to payment, ensuring both parties are protected throughout the process.

### Core User Flow

The system follows this basic journey:

**Parent Registration → Tutor Discovery → Book Session → Pay Platform → Session Happens → Platform Pays Tutor**

### 1.1 User Management

#### How Parents Join the Platform

When a parent first arrives, they create an account by providing their email, password, name, and phone number. After registration, they add details about their student (or students if they have multiple children). This includes the student's name and current grade level. Once this setup is complete, they can start browsing available tutors.

#### How Tutors Join the Platform

Tutors go through a similar but slightly more detailed registration process. They provide their basic information, then complete their profile by listing the subjects they teach, their hourly rate, and their availability. Critically, they also need to provide their bank account details so we can pay them later.

Before a tutor can appear in searches or accept bookings, we verify them manually. This verification step ensures quality and safety for our parents. Once approved, the tutor's profile goes live and they can start receiving booking requests.

### 1.2 Booking Process

#### How Sessions Get Scheduled

Parents can search or browse through our tutor profiles based on subjects, rates, and availability. When they find a tutor they like, they select a time slot and create a booking request. The tutor receives a notification and has the option to accept or decline.

If the tutor accepts, the session moves forward and the parent must complete payment to confirm the booking. If the tutor declines (perhaps due to a schedule conflict), the parent is notified and can choose a different tutor or time slot.

#### Session States Throughout the Lifecycle

We track sessions through five main states:

- **Pending Approval:** The tutor hasn't responded yet
- **Awaiting Payment:** The tutor said yes, but we're waiting for payment
- **Scheduled:** Payment confirmed, session is locked in
- **Completed:** Session finished successfully
- **Cancelled:** Either party cancelled the session

### 1.3 Payment and Escrow System

This is the heart of our platform's value proposition. We protect both parties by holding funds until service delivery is confirmed.

#### Step 1: Parent Pays Us

Once a tutor accepts a booking request, the parent is prompted to pay. They pay the full session cost through our payment gateway (we'll use Paystack or Flutterwave). When the payment is confirmed, we receive the funds and the session status changes to "scheduled." Both the parent and tutor receive confirmation notifications.

#### Step 2: We Hold the Funds

The money sits in our platform account. We immediately calculate our platform fee (15% of the session cost) and set it aside. The remaining 85% is reserved for the tutor's payout. The funds stay in this escrow state until the session is completed and confirmed.

**Example:**
- Session cost: ₦10,000
- Platform fee (15%): ₦1,500
- Amount reserved for tutor: ₦8,500

#### Step 3: Session Happens

On the scheduled date and time, the session takes place. Either the parent or tutor can mark the session as complete in the system. To protect against disputes, we have a 48-hour confirmation window. If no one raises an issue within 48 hours of the session, we automatically mark it as confirmed.

#### Step 4: We Pay the Tutor

Once a session is confirmed as complete, we release the tutor's payment. However, rather than processing individual transfers for every session (which would incur high transaction fees), we batch all tutor payouts and process them weekly. Every Friday at 10am, we transfer funds to all tutors who have completed sessions that week. Tutors receive a notification when their payout is processed.

### 1.4 Cancellation Policy

We need clear rules for cancellations to be fair to both parties.

#### Cancellations More Than 24 Hours Before Session

**If a parent cancels with more than 24 hours' notice:**
- They receive a full refund (minus a small processing fee)
- The tutor doesn't receive any payment since they still have time to fill that slot with another student

**If a tutor cancels with more than 24 hours' notice:**
- The parent receives a full refund with no fees
- We may issue a warning to the tutor depending on their cancellation history

#### Cancellations Less Than 24 Hours Before Session

This is where it gets more nuanced because the tutor has likely already prepared and turned down other opportunities.

**If a parent cancels with less than 24 hours' notice:**
- They receive a 50% refund
- The other 50% goes to the tutor as a cancellation fee (minus our platform fee)
- This compensates the tutor for the short-notice cancellation

**If a tutor cancels with less than 24 hours' notice:**
- The parent receives a full refund
- The tutor receives a penalty or warning
- Repeated late cancellations by tutors may result in suspension

#### No-Show Situations

**If a parent or student doesn't show up:**
- The tutor receives the full payment
- They held up their end of the agreement

**If a tutor doesn't show up:**
- The parent receives a full refund
- The tutor faces serious penalties, potentially including suspension from the platform

### 1.5 Dispute Resolution

Despite our best efforts, disagreements will occasionally arise. We have a straightforward process to handle them.

#### How Disputes Work

Either party can raise a dispute within 48 hours of the scheduled session time. Common reasons include claims that someone didn't show up, the session was cut short, or there were quality issues.

When a dispute is raised, we immediately hold the tutor's payment (don't release it). Our admin team reviews the case manually. We look at all available evidence: session logs, timestamps of who logged in when, any messages between the parties, and both sides' explanations.

After reviewing everything, we make a decision:
- Award the full payment to the tutor if the parent's claim seems unfounded
- Issue a full refund to the parent if the tutor clearly didn't deliver
- Split it 50/50 if both parties share some responsibility

Once we execute the decision, the case is closed.

---

## 2. DATA FIELDS DEFINITION

To build this system, we need to define exactly what information we'll track. Here are the seven core data entities with all their required fields.

### 2.1 Parent Records

| Field | Type | Required | Purpose |
|-------|------|----------|---------|
| parent_id | UUID | Yes | Unique identifier for this parent |
| email | String | Yes | Login credential and contact |
| password_hash | String | Yes | Encrypted password (never plain text) |
| first_name | String | Yes | Parent's first name |
| last_name | String | Yes | Parent's last name |
| phone | String | Yes | Contact number (+234XXXXXXXXXX) |
| created_at | Timestamp | Yes | When they registered |
| account_status | Enum | Yes | Either "active" or "suspended" |

### 2.2 Student Records

| Field | Type | Required | Purpose |
|-------|------|----------|---------|
| student_id | UUID | Yes | Unique identifier for this student |
| parent_id | UUID | Yes | Links to their parent's account |
| first_name | String | Yes | Student's first name |
| last_name | String | Yes | Student's last name |
| grade_level | String | No | Current grade (e.g., "JSS2", "SS1") |
| created_at | Timestamp | Yes | When record was created |

A single parent can have multiple student records. This allows parents with multiple children to manage all their tutoring needs from one account.

### 2.3 Tutor Records

| Field | Type | Required | Purpose |
|-------|------|----------|---------|
| tutor_id | UUID | Yes | Unique identifier for this tutor |
| email | String | Yes | Login credential and contact |
| password_hash | String | Yes | Encrypted password |
| first_name | String | Yes | Tutor's first name |
| last_name | String | Yes | Tutor's last name |
| phone | String | Yes | Contact number |
| subjects | Array | Yes | List of subjects they teach |
| hourly_rate | Decimal | Yes | Their rate in Naira |
| bank_name | String | Yes | For processing payouts |
| account_number | String | Yes | For processing payouts |
| account_name | String | Yes | For verification |
| verification_status | Enum | Yes | "pending", "approved", or "rejected" |
| account_status | Enum | Yes | "active" or "suspended" |
| created_at | Timestamp | Yes | When they registered |

The subjects field stores an array like `["Mathematics", "English", "Physics"]` so tutors can teach multiple subjects.

### 2.4 Session Records

| Field | Type | Required | Purpose |
|-------|------|----------|---------|
| session_id | UUID | Yes | Unique identifier for this session |
| parent_id | UUID | Yes | Who made the booking |
| student_id | UUID | Yes | Which student is learning |
| tutor_id | UUID | Yes | Who's teaching |
| subject | String | Yes | What they're learning (e.g., "Mathematics") |
| scheduled_date | Date | Yes | Session date (YYYY-MM-DD) |
| scheduled_start_time | Time | Yes | When it starts (HH:MM) |
| scheduled_end_time | Time | Yes | When it ends (HH:MM) |
| duration_minutes | Integer | Yes | Length in minutes (e.g., 60) |
| session_cost | Decimal | Yes | What the parent pays |
| platform_fee | Decimal | Yes | Our 15% commission |
| tutor_payout | Decimal | Yes | What the tutor receives (85%) |
| status | Enum | Yes | Current state of the session |
| created_at | Timestamp | Yes | When the booking was made |
| updated_at | Timestamp | Yes | Last time anything changed |
| completed_at | Timestamp | No | When marked as complete |
| cancelled_at | Timestamp | No | When cancelled (if applicable) |
| cancellation_reason | Text | No | Why it was cancelled |

The status field uses these values: `"pending_approval"`, `"awaiting_payment"`, `"scheduled"`, `"completed"`, or `"cancelled"`.

### 2.5 Payment Records (Parent to Platform)

| Field | Type | Required | Purpose |
|-------|------|----------|---------|
| payment_id | UUID | Yes | Unique identifier for this payment |
| session_id | UUID | Yes | Which session this pays for |
| parent_id | UUID | Yes | Who made the payment |
| amount | Decimal | Yes | Total amount paid |
| payment_method | Enum | Yes | How they paid (card, transfer, wallet) |
| payment_provider | String | No | "Paystack" or "Flutterwave" |
| provider_reference | String | No | External transaction ID |
| status | Enum | Yes | Current state of payment |
| initiated_at | Timestamp | Yes | When payment started |
| confirmed_at | Timestamp | No | When it succeeded |
| refunded_at | Timestamp | No | When refund processed |
| refund_amount | Decimal | No | Amount refunded (if partial) |

Payment status values are: `"pending"`, `"successful"`, `"failed"`, or `"refunded"`.

### 2.6 Payout Records (Platform to Tutor)

| Field | Type | Required | Purpose |
|-------|------|----------|---------|
| payout_id | UUID | Yes | Unique identifier for this payout |
| session_id | UUID | Yes | Which session earned this |
| tutor_id | UUID | Yes | Who receives the money |
| amount | Decimal | Yes | Tutor's payout amount |
| status | Enum | Yes | Current state of payout |
| scheduled_date | Date | No | When we'll process it |
| released_at | Timestamp | No | When approved for payment |
| paid_at | Timestamp | No | When money was transferred |
| bank_reference | String | No | Bank confirmation number |

Payout status values are: `"pending"`, `"held"`, `"released"`, `"paid"`, or `"withheld"`.

### 2.7 Dispute Records

| Field | Type | Required | Purpose |
|-------|------|----------|---------|
| dispute_id | UUID | Yes | Unique identifier for this dispute |
| session_id | UUID | Yes | Which session is disputed |
| raised_by | Enum | Yes | Who raised it ("parent" or "tutor") |
| raised_by_id | UUID | Yes | Their user ID |
| reason | String | Yes | Brief reason category |
| description | Text | Yes | Detailed explanation |
| raised_at | Timestamp | Yes | When dispute opened |
| status | Enum | Yes | "open" or "resolved" |
| resolution | Text | No | Admin's decision explanation |
| resolved_at | Timestamp | No | When case closed |
| parent_refund | Decimal | No | Amount refunded to parent |
| tutor_payment | Decimal | No | Amount paid to tutor |

---

## 3. SESSION LOGS

Session logs are our audit trail. They record every significant event in a session's lifecycle, which is crucial for dispute resolution, debugging, and understanding how our platform is performing.

### Why We Need Logs

Imagine a parent claims their tutor never showed up, but the tutor insists they joined on time and the student wasn't there. Without logs, it's their word against each other. With detailed session logs, we can see exactly who logged in when, giving us objective evidence to resolve the dispute fairly.

Beyond disputes, logs help us understand system behavior, identify bottlenecks, and provide analytics on completion rates and user behavior.

### Log Structure

Every log entry records:

| Field | Type | Required | Purpose |
|-------|------|----------|---------|
| log_id | UUID | Yes | Unique identifier for this log entry |
| session_id | UUID | Yes | Which session this is about |
| timestamp | Timestamp | Yes | Exact moment the event occurred |
| actor_type | Enum | Yes | Who did it: "parent", "tutor", or "system" |
| actor_id | UUID | No | The user's ID (null if system action) |
| action | String | Yes | What happened |
| status_before | Enum | No | Session state before this action |
| status_after | Enum | No | Session state after this action |
| details | JSON | No | Additional context specific to this event |

### Events We Track

Here are the 14 types of events we log throughout a session's lifecycle:

#### During Booking

1. **session_created** - When a parent creates a booking request. We log which student, tutor, date, time, and cost.
2. **tutor_notified** - When our system sends the booking notification to the tutor.
3. **tutor_accepted** - When the tutor accepts the booking. Session moves from "pending_approval" to "awaiting_payment".
4. **tutor_declined** - When the tutor declines. We log their reason and the session becomes "cancelled".

#### During Payment

5. **payment_initiated** - When the parent clicks "Pay Now" and enters their payment details.
6. **payment_confirmed** - When our payment provider confirms the money came through. Session moves to "scheduled".
7. **payment_failed** - When the payment doesn't go through (card declined, insufficient funds, etc.). Session stays "awaiting_payment".

#### During Session Execution

8. **session_reminder_sent** - When our system sends automated reminders (24 hours before and 1 hour before).
9. **session_started** - When someone marks the session as in progress.
10. **session_completed** - When the session is marked as finished. This is a critical event because it triggers the payment release process.

#### During Payout

11. **payout_released** - When the 48-hour confirmation period passes and we approve the tutor's payment.
12. **payout_processed** - When we actually transfer the money to the tutor's bank account.

#### For Cancellations

13. **session_cancelled** - When either party cancels. We log who cancelled, why, and what refund amount applies.

#### For Disputes

14. **dispute_raised** - When someone files a dispute. We log all the details they provide.
15. **dispute_resolved** - When an admin closes the case. We log the decision and how funds were distributed.

### Sample Log Entries

#### Example 1: Session Created

```json
{
  "log_id": "LOG_001",
  "session_id": "SES_123",
  "timestamp": "2026-01-29T10:00:00Z",
  "actor_type": "parent",
  "actor_id": "PAR_456",
  "action": "session_created",
  "status_before": null,
  "status_after": "pending_approval",
  "details": {
    "tutor_id": "TUT_789",
    "student_id": "STU_321",
    "date": "2026-02-01",
    "time": "14:00",
    "subject": "Mathematics",
    "cost": 10000
  }
}
```

#### Example 2: Payment Confirmed

```json
{
  "log_id": "LOG_002",
  "session_id": "SES_123",
  "timestamp": "2026-01-29T10:15:00Z",
  "actor_type": "system",
  "actor_id": null,
  "action": "payment_confirmed",
  "status_before": "awaiting_payment",
  "status_after": "scheduled",
  "details": {
    "amount": 10000,
    "payment_method": "card",
    "provider": "Paystack",
    "reference": "PSK_123456789"
  }
}
```

#### Example 3: Session Completed

```json
{
  "log_id": "LOG_003",
  "session_id": "SES_123",
  "timestamp": "2026-02-01T15:05:00Z",
  "actor_type": "parent",
  "actor_id": "PAR_456",
  "action": "session_completed",
  "status_before": "scheduled",
  "status_after": "completed",
  "details": {
    "completed_by": "parent",
    "actual_duration": 65,
    "confirmation": "Session went well"
  }
}
```

These logs give us a complete, timestamped record of everything that happened. If there's ever a question about a session, we have the evidence to answer it definitively.

---

## 4. PAYMENT STATUS MANAGEMENT

Payment status is one of the most critical aspects of our platform. We're handling real money and people's livelihoods, so we need to track payment states meticulously.

We actually track two separate payment flows: money coming in from parents, and money going out to tutors. Each has its own state machine.

### 4.1 Parent Payment States

When a parent pays us, their payment moves through these states:

**Pending** - The payment has been initiated but we haven't received confirmation yet. The parent clicked "Pay Now" and entered their card details, and the payment processor is working on it. This typically lasts just a few seconds, but can take longer with bank transfers.

**Successful** - We've received the money. The payment gateway has confirmed the transaction and the funds are in our account. At this point, the session moves to "scheduled" status.

**Failed** - Something went wrong. Maybe their card was declined, or they had insufficient funds, or there was a technical issue. The session stays in "awaiting_payment" and the parent can try again.

**Refunded** - We've returned the money to the parent. This happens when a session is cancelled or when we resolve a dispute in the parent's favor.

**The flow:**
```
Parent clicks Pay → pending → successful → (session happens) → refunded (only if cancelled/disputed)
                            ↓
                          failed (payment didn't work)
```

### 4.2 Tutor Payout States

The tutor's payment journey is more complex because it depends on session completion and confirmation:

**Pending** - The session hasn't happened yet. We're not even thinking about paying the tutor until the session is complete.

**Held** - The session finished, but we're in the 48-hour confirmation window. We're holding the money but haven't released it yet. This protects against disputes and gives the parent time to confirm everything went well.

**Released** - The confirmation period passed with no issues (or the parent manually confirmed), so we've approved the payment. It's now queued for our next weekly payout batch.

**Paid** - We've transferred the money to the tutor's bank account. The tutor has received their funds. This is the final state for a successful transaction.

**Withheld** - A dispute was raised, so we're blocking the payment until we resolve it. Depending on the outcome, it might move to "released" or be cancelled entirely.

**The typical flow:**
```
Session scheduled → pending → (session completes) → held (48 hours) → released (Friday payout) → paid
                                                                     ↓
                                                                   withheld (if dispute)
```

### 4.3 State Transition Rules

These are the business rules that govern when payments can change states:

**Rule 1: No scheduled session without confirmed payment**  
A session only reaches "scheduled" status when the parent payment is "successful". If payment fails or is still pending, the session cannot be scheduled. This protects tutors from no-pay bookings.

**Rule 2: Automatic release after confirmation period**  
When a session reaches "completed" status, we start a 48-hour timer. If no dispute is raised within those 48 hours, the tutor payout automatically moves from "held" to "released". This ensures tutors get paid even if the parent forgets to manually confirm.

**Rule 3: Disputes block everything**  
The moment anyone raises a dispute, the tutor payout immediately moves to "withheld" status. It stays there until our admin team resolves the case. This protects parents from losing money on sessions that didn't happen properly.

**Rule 4: Refunds process quickly**  
When a session is cancelled, the parent payment status changes to "refunded" and we process the refund within 24 hours. We don't make parents wait for their money back.

**Rule 5: Payouts are batched weekly**  
Every Friday at 10am, we process all tutor payouts with "released" status. They all move to "paid" status at once. This batching reduces transaction fees and administrative overhead.

### 4.4 Payment Calculations

Here's how the money breaks down in different scenarios:

#### Standard Successful Session

- **Session Cost:** ₦10,000 (tutor's hourly rate)
- **Parent Pays:** ₦10,000
- **Platform Fee (15%):** ₦1,500
- **Tutor Receives:** ₦8,500

#### Late Cancellation (Less than 24 hours notice)

- **Original Cost:** ₦10,000
- **Parent Gets Back:** ₦5,000 (50% refund)
- **Platform Fee:** ₦750 (half of normal fee)
- **Tutor Receives:** ₦4,250 (50% minus platform fee)

The tutor still gets something because they likely turned down other opportunities and prepared for this session.

#### Early Cancellation (More than 24 hours notice)

- **Original Cost:** ₦10,000
- **Parent Gets Back:** ₦9,900 (full refund minus processing)
- **Processing Fee:** ₦100 (we absorb this)
- **Tutor Receives:** ₦0
- **Platform Loses:** ₦100

This is fair because the tutor still has time to book another student in that slot.

### 4.5 Tracking Payment History

For both parent payments and tutor payouts, we maintain a complete history of all status changes. This gives us a timeline of exactly what happened and when.

#### Sample Parent Payment Record

```json
{
  "payment_id": "PAY_001",
  "session_id": "SES_123",
  "parent_id": "PAR_456",
  "amount": 10000,
  "status": "successful",
  "status_history": [
    {
      "status": "pending",
      "timestamp": "2026-01-29T10:10:00Z",
      "triggered_by": "parent"
    },
    {
      "status": "successful",
      "timestamp": "2026-01-29T10:10:45Z",
      "triggered_by": "system",
      "details": {
        "provider": "Paystack",
        "reference": "PSK_123456"
      }
    }
  ]
}
```

#### Sample Tutor Payout Record

```json
{
  "payout_id": "POUT_001",
  "session_id": "SES_123",
  "tutor_id": "TUT_789",
  "amount": 8500,
  "status": "paid",
  "status_history": [
    {
      "status": "pending",
      "timestamp": "2026-01-29T10:00:00Z"
    },
    {
      "status": "held",
      "timestamp": "2026-02-01T15:05:00Z",
      "triggered_by": "parent",
      "details": "Session completed"
    },
    {
      "status": "released",
      "timestamp": "2026-02-03T15:05:00Z",
      "triggered_by": "system",
      "details": "48hr confirmation period passed"
    },
    {
      "status": "paid",
      "timestamp": "2026-02-07T10:00:00Z",
      "triggered_by": "system",
      "details": {
        "batch": "BATCH_FRI_020726",
        "bank_reference": "TRF_123456"
      }
    }
  ]
}
```

This level of detail means we can answer any question about when and why a payment changed status. It's essential for customer support, dispute resolution, and financial auditing.

---

## 5. KEY DECISIONS FOR IMPLEMENTATION

Before we start building, we need to make some important decisions about how the platform will operate. Here are the main choices we face, along with my recommendations:

### Platform Fee Structure

**Options:**
- 10% (lower fee, more competitive but less revenue)
- 15% (industry standard, balanced approach)
- 20% (higher fee, more revenue but may discourage tutors)

**Recommendation:** Start with 15%. This is what most education marketplaces charge and tutors generally expect it. We can adjust later based on market response.

### Payout Schedule

**Options:**
- Per session (immediate payout after each session)
- Weekly (batch payouts every Friday)
- Bi-weekly (twice per month)
- Monthly (once per month)

**Recommendation:** Weekly payouts every Friday. This is frequent enough that tutors don't feel like they're waiting forever, but not so frequent that we're drowning in transaction fees. It also gives us better cash flow management.

### Confirmation Period

**Options:**
- 24 hours (quick but might not catch all issues)
- 48 hours (balanced approach)
- 72 hours (safer but tutors wait longer)

**Recommendation:** 48 hours. This gives parents enough time to report issues without making tutors wait too long for their money. Most problems surface within two days anyway.

### Cancellation Window

**Options:**
- 12 hours (strict policy)
- 24 hours (standard approach)
- 48 hours (more flexible)

**Recommendation:** 24 hours. This is what most service platforms use. It's enough notice for a tutor to potentially fill the slot while being reasonable for parents who might have emergencies.

### Late Cancellation Penalty

**Options:**
- 0% to parent, 100% to tutor (very strict)
- 30% to parent, 70% to tutor (tutor-friendly)
- 50% to parent, 50% to tutor (balanced)

**Recommendation:** 50/50 split. This feels fair to both parties. The parent doesn't lose everything for a last-minute emergency, but the tutor is compensated for the lost opportunity and their preparation time.

---

## Next Steps

This document provides the foundation for our MVP implementation. The backend logic, data fields, session logs, and payment status definitions are now clearly documented and ready to guide development.

The immediate next step is to review these specifications with the team, particularly Glo and Goodness who are working on the user flow. We need to ensure the frontend design aligns with this backend logic. Once everyone is aligned, we can begin setting up our database structure and implementing the manual processes that will eventually be automated.

---

**Document Prepared By:** Pleasant  
**Role:** Backend Logic & API Infrastructure  
**Last Updated:** January 29, 2026
