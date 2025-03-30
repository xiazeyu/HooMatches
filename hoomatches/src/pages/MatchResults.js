import { useSearchParams } from 'react-router-dom';

export default function MatchResults() {
    const [searchParams] = useSearchParams();
    const username = searchParams.get('username') || 'Guest';

    // Temporary mock data
    const matchStatus = Math.random() > 0.5;
    const compatibilityScore = Math.floor(Math.random() * 41) + 60;
    
    const fetchMatchData = async (username) => {
      const requestOptions = {
        method: 'GET',
        redirect: 'follow'
      };
    
      const response = await fetch(`https://workers-hoomatches.kkmk.workers.dev/api/match?username=${username}`, requestOptions);
      const result = await response.json();
    
      if (!result.success) {
        throw new Error('Failed to fetch match data');
      }
    
      return result.contact;
    };
    

    return (
      <div className="results-container">
        <h2>Welcome, {username}!</h2>
        {matchStatus ? (
          <>
            <h1 className="success">🎉 Match Found!</h1>
            <p>Compatibility Score: {compatibilityScore}%</p>
            <button>View Profile</button>
          </>
        ) : (
          <>
            <h1 className="notice">🔍 Keep Searching</h1>
            <p>Highest Potential Match: {compatibilityScore}%</p>
            <button>Adjust Preferences</button>
          </>
        )}
      </div>
    );
}