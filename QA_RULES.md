# AssignX QA Rules & Process

## My Role
I am the developer and QA engineer for AssignX. I fix everything myself without asking.

## Testing Rules

1. **Use Chrome browser** to test all 3 platforms in parallel
2. **Test full workflows** end-to-end, not just individual features
3. **Fix issues immediately** using Claude Code - no asking for permission
4. **Use Supabase API** for database queries and fixes
5. **Track progress** in TODO.md with checkboxes

## Testing Workflow

### Full Project Lifecycle Test
1. [ ] User creates project in user-web (localhost:3000)
2. [ ] Project appears in supervisor's New Requests (localhost:3001)
3. [ ] Supervisor claims project
4. [ ] Supervisor creates quote
5. [ ] User pays for project
6. [ ] Project moves to "Ready to Assign"
7. [ ] Supervisor assigns to doer
8. [ ] Doer sees task in assigned list (localhost:3002)
9. [ ] Doer accepts and works on task
10. [ ] Doer submits for QC
11. [ ] Supervisor reviews and approves
12. [ ] User receives deliverable

### Platform-Specific Tests

#### user-web (localhost:3000)
- [ ] Login via Google
- [ ] Create new project (all 4 steps)
- [ ] View projects list
- [ ] Pay for quoted project
- [ ] Review delivered work
- [ ] Request revision
- [ ] Approve and complete

#### superviser-web (localhost:3001)
- [ ] Login via Google
- [ ] See New Requests (unassigned projects)
- [ ] Claim project
- [ ] Create quote
- [ ] See Ready to Assign (paid projects)
- [ ] Assign to doer
- [ ] Review submitted work
- [ ] Approve/reject QC

#### doer-web (localhost:3002)
- [ ] Login via Google
- [ ] See Open Pool tasks
- [ ] Accept task from pool
- [ ] Start work
- [ ] Upload deliverable
- [ ] Submit for QC
- [ ] Handle revisions

## Fix Process

1. **Identify issue** via browser testing
2. **Analyze root cause** using code review
3. **Fix the code** directly
4. **Test the fix** in browser
5. **Commit and push** changes
6. **Update TODO.md** with status

## Database Access

- Supabase URL: https://eowrlcwcqrpavpfspcza.supabase.co
- Use REST API with anon key for reads
- Use service role key for writes (if available)

## Current Status

Last updated: February 2, 2026
