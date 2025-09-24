import requests

API_URL = "http://localhost:8000/events"  # adjust if backend is deployed

events = [
    {
        "id": "animatronics",
        "title": "Animatronics",
        "theme": "Time Travelers' Museum",
        "fullThemeUrl": "https://example.com/full-theme/animatronics",
        "description": 'Create an animatronic figure or scene from a key moment in American history. The character should "come to life" to explain their world to a young audience.',
        "category": "Engineering",
        "teamSize": "1-3 members",
        "types": ["onsite testing", "poster"],
        "rubricUrl": "#",
    },
    {
        "id": "coding",
        "title": "Coding",
        "theme": "Programming Challenge",
        "description": "Solve complex programming problems using various programming languages including Python, Java, C++, and more.",
        "category": "Programming",
        "teamSize": "1 member",
        "types": ["prelim submission", "testing"],
        "rubricUrl": "#",
    },
    {
        "id": "video-game-design",
        "title": "Video Game Design",
        "theme": "Retro Revival",
        "fullThemeUrl": "https://example.com/full-theme/video-game-design",
        "description": "Reimagine an 8-bit or 16-bit era type of game with a modern twist. Create engaging gameplay with contemporary elements.",
        "category": "Design",
        "teamSize": "1-6 members",
        "types": ["prelim submission", "portfolio"],
        "rubricUrl": "#",
    },
    {
        "id": "robotics",
        "title": "Robotics",
        "theme": "Design Problem",
        "description": "Design, build, and program a robot to complete specific tasks and challenges outlined in the official competition rules.",
        "category": "Engineering",
        "teamSize": "2-6 members",
        "types": ["onsite challenge", "testing"],
        "rubricUrl": "#",
    },
    {
        "id": "digital-video-production",
        "title": "Digital Video Production",
        "theme": "A Twist in Time",
        "fullThemeUrl": "https://example.com/full-theme/digital-video-production",
        "description": "Create a story that alters a key historical moment—or imagines a character from the past suddenly appearing in the modern day.",
        "category": "Media",
        "teamSize": "1-6 members",
        "types": ["prelim submission", "video"],
        "rubricUrl": "#",
    },
    {
        "id": "webmaster",
        "title": "Webmaster",
        "theme": "Community Resource Hub",
        "description": "Create a website that will serve as a community resource hub to highlight resources available to residents within the community.",
        "category": "Programming",
        "teamSize": "1-6 members",
        "types": ["portfolio", "website"],
        "rubricUrl": "#",
    },
    {
        "id": "biotechnology-design",
        "title": "Biotechnology Design",
        "theme": "Bioconjugation",
        "description": "Highlight the science behind bioconjugation and demonstrate one of its many uses in medicine, diagnostics, or materials.",
        "category": "Science",
        "teamSize": "1-6 members",
        "types": ["testing", "research"],
        "rubricUrl": "#",
    },
    {
        "id": "music-production",
        "title": "Music Production",
        "theme": "USA 250th Birthday",
        "description": "Create a musical piece that can be played as the opening number at a July 4th fireworks show celebrating America's 250th birthday.",
        "category": "Media",
        "teamSize": "1-6 members",
        "types": ["prelim submission", "music"],
        "rubricUrl": "#",
    },
]

for event in events:
    response = requests.post(API_URL + "/", json=event)
    if response.status_code == 200:
        print(f"✅ Uploaded: {event['title']}")
    else:
        print(f"❌ Failed: {event['title']} ({response.status_code}) {response.text}")