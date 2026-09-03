-- BURP — Community Outreach: seed the initial round + the 4 drafted initiatives
-- Run this ONCE after schema-outreach.sql, in the Supabase SQL Editor.
-- Safe to re-run: it checks for an existing round with this title first.

do $$
declare
  v_round_id uuid;
begin
  select id into v_round_id from public.outreach_rounds where title = 'BURP Community Outreach 2026';

  if v_round_id is null then
    insert into public.outreach_rounds (title, phase)
    values ('BURP Community Outreach 2026', 'collecting')
    returning id into v_round_id;

    insert into public.outreach_ideas (round_id, title, summary, description, is_shortlisted, display_order, approved)
    values
    (
      v_round_id,
      'Sponsor-a-Child & "ORA Back-to-School" Project',
      'Sustained Educational Support & Youth Development',
      E'This initiative targets children from financially vulnerable families who are academically capable but at risk of dropping out due to economic pressures.\n\nCore Package ("One Child, One Package"):\n- Full school tuition and examination fees\n- Custom-fitted school uniforms and footwear\n- Complete textbook, exercise book, and stationery kit\n- School bag and daily transport support\n\nImplementation Options:\n- Direct Household Identification: Identify children within local communities through internal member recommendations.\n- School Partnership Model: Partner directly with administrators at schools in economically disadvantaged communities to identify specific students facing dropout risks.',
      true, 1, true
    ),
    (
      v_round_id,
      '"No Child Learns Hungry" School Nutrition Program',
      'Nutrition, Attendance, and Cognitive Focus',
      E'For many young learners, the primary barrier to academic success is not tuition, but food insecurity. Hunger severely impacts concentration, attendance, and cognitive development.\n\nProgram Elements:\n- Subsidized or fully covered daily breakfasts and lunches served at school.\n- Provision of healthy daily snacks and essential take-home meal packages for weekends or holidays.\n- Partnerships with local school canteens or community vendors to deliver clean, nutritious meals directly to supported children.',
      true, 2, true
    ),
    (
      v_round_id,
      'BURP Digital Inclusion & Tech Hub Project',
      'Skill Building & Technology Exposure',
      E'Economic disadvantage should not preclude children from accessing essential modern technology. This project leverages our community''s existing tech professionals to bridge the digital divide.\n\nProgram Elements:\n- Hardware Drive: Collect, refurbish, and deploy donated laptops, tablets, and desktop computers.\n- Mini Digital Hub Setup: Establish a secure, equipped mini computer lab within a partner school or community facility.\n\nStructured Curriculum:\n- Computer Basics & Typing Literacy\n- Microsoft Office Productivity Suite\n- Internet Research & Online Safety\n- Introductory Coding & Algorithmic Thinking',
      true, 3, true
    ),
    (
      v_round_id,
      '"Adopt an Elder" Senior Care Initiative',
      'Elderly Care, Dignity, and Companionship',
      E'Vulnerable seniors in our neighborhoods often suffer from social isolation and lack basic practical support. This program provides consistent personal engagement rather than mere material drop-offs.\n\nProgram Elements:\n- Consistent Visits: Bi-weekly or monthly 30-to-60-minute personal visits for fellowship, storytelling, and companionship.\n- Care Packages: Delivery of essential food items, non-perishable goods, and tailored personal care/hygiene products.\n- Practical Assistance: Light household help, medication coordination support, and errands.',
      true, 4, true
    );
  end if;
end $$;
