import './App.css'

const communityItems = [
  {
    id: 'study-jam',
    title: 'Coffee and Chill',
    kind: 'Workshop',
    date: 'Thursday, Oct 2',
    time: '10:00 AM to 1:00 PM',
    location: 'CS Building at Room 1240',
    blurb:
      'Free coffee, code mentors and light snacks.',
    actionLabel: 'RSVP on Google Form',
    actionHref: 'https://forms.gle/',
    tag: 'Hands-on'
  },
  {
    id: 'study-jam',
    title: 'React Study Jam',
    kind: 'Workshop',
    date: 'Friday, Oct 3',
    time: '10:00 AM to 1:00 PM',
    location: 'CS Building at Room 1240',
    blurb:
      'Sprint through component patterns with mentors and build a mini feature using hooks and state.',
    actionLabel: 'Waitlist Open',
    actionHref: 'https://forms.gle/',
    tag: 'Hands-on'
  },
  {
    id: 'study-jam',
    title: 'Engineer Can Cook',
    kind: 'Workshop',
    date: 'Saturday, Oct 4',
    time: '6:00 PM to 8:00 PM',
    location: 'CS Building - 4th Floor Kitchen',
    blurb:
      'Who said engineers cannot cook? Come join us for a fun evening of cooking and networking.',
    actionLabel: 'Waitlist Open',
    actionHref: 'https://forms.gle/',
    tag: 'Hands-on'
  },
  {
    id: 'study-jam',
    title: 'React Study Jam 2',
    kind: 'Workshop',
    date: 'Saturday, Oct 4',
    time: '10:00 AM to 1:00 PM',
    location: 'CS Building - Room 1240',
    blurb:
      'Sprint through component patterns with mentors and build a mini feature using hooks and state.',
    actionLabel: 'RSVP on Google Form',
    actionHref: 'https://forms.gle/',
    tag: 'Hands-on'
  },
  {
    id: 'breaking-into-se',
    title: 'Breaking Into Software Engineering',
    kind: 'Panel + Q&A',
    date: 'Friday, Oct 10',
    time: '6:00 PM to 7:30 PM',
    location: 'Union South in Landmark Room',
    blurb:
      'Hear from recent CodePath alumni about internship search strategies, technical interviews, and balancing classes.',
    actionLabel: 'Save a seat',
    actionHref: 'https://forms.gle/',
    tag: 'Career'
  },
  {
    id: 'code-labs',
    title: 'Code Labs: Portfolio Power Hour',
    kind: 'Drop-in Lab',
    date: 'Every Wednesday',
    time: '4:00 PM to 6:00 PM',
    location: 'Engineering Hall in Room 2645',
    blurb:
      'Bring your side projects for a rapid feedback loop with peers and mentors. Deploy help available on-site.',
    actionLabel: 'Add to calendar',
    actionHref: 'https://forms.gle/',
    tag: 'Ongoing'
  },
  {
    id: 'faang-101',
    title: 'Big Tech Interview Guide',
    kind: 'Resource PDF',
    date: 'Updated Monthly',
    time: 'Self-paced',
    location: 'Download',
    blurb:
      'A curated prep packet covering data structures, behavioural prompts, and whiteboard drills built by CodePath TAs.',
    actionLabel: 'Download PDF',
    actionHref: 'https://forms.gle/',
    tag: 'Resource'
  },
  {
    id: 'swift-sunday',
    title: 'Swift Sunday Build-Along',
    kind: 'Event',
    date: 'Every Sunday',
    time: '11:00 AM to Noon',
    location: 'Mogridge Hall in Room 130',
    blurb:
      'Follow along as we ship a campus dining app screen using SwiftUI. Includes starter repo and Q&A chat.',
    actionLabel: 'Register Now',
    actionHref: 'https://forms.gle/',
    tag: 'In-Person'
  },
  {
    id: 'swift-sunday',
    title: 'C Sunday Build-Along',
    kind: 'Event',
    date: 'Every Saturday',
    time: '11:00 AM to Noon',
    location: 'Modgridge Hall in Hello World',
    blurb:
      'Follow along as we ship a campus dining app screen using SwiftUI. Includes starter repo and Q&A chat.',
    actionLabel: 'Register Now',
    actionHref: 'https://forms.gle/',
    tag: 'In-Person'
  },
  {
    id: 'internship-database',
    title: 'Fall Internship Tracker',
    kind: 'Airtable Board',
    date: 'New roles added weekly',
    time: 'Self-paced',
    location: 'Shared Workspace',
    blurb:
      'Stay on top of application deadlines with filters for majors, visa sponsorship, and location preferences.',
    actionLabel: 'Open tracker',
    actionHref: 'https://forms.gle/',
    tag: 'Resource'
  }
]

function App() {
  return (
    <div className="app-shell">
      <header className="hero">
        <p className="eyebrow">CodePath Future Engineers</p>
        <h1>Software Engineering Launchpad</h1>
        <p className="hero-subtitle">
          Plug into skill-building meetups, live streams, and curated resources designed for Badger developers
          leveling up for internships.
        </p>
      </header>

      <section className="board">
        {communityItems.map((item) => (
          <article key={item.id} className="card">
            <div className="card-header">
              <span className="card-tag">{item.tag}</span>
              <p className="card-kind">{item.kind}</p>
            </div>

            <h2>{item.title}</h2>

            <dl className="card-meta">
              <div>
                <dt>Date</dt>
                <dd>{item.date}</dd>
              </div>
              <div>
                <dt>Time</dt>
                <dd>{item.time}</dd>
              </div>
              <div>
                <dt>Where</dt>
                <dd>{item.location}</dd>
              </div>
            </dl>

            <p className="card-blurb">{item.blurb}</p>

            <a className="card-action" href={item.actionHref} target="_blank" rel="noreferrer">
              {item.actionLabel}
            </a>
          </article>
        ))}
      </section>
    </div>
  )
}

export default App
