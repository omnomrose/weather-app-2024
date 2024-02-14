import { useState } from "react";
import axios from "axios";
import Head from "next/head";
import Image from 'next/image';
import styles from '@/styles/Home.module.css';

export default function Home() {
  const [location, setLocation] = useState<string>("");
  const [currentData, setCurrentData] = useState<ICurrent | null>(null);
  const [fiveDay, setfiveDay] = useState<IFive[] | null>(null);

  const apiKey = process.env.NEXT_PUBLIC_API;

  const dateFix = (date: string): string => {
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
  };

  const fetchData = async () => {
    try {
        const currentResponse = await axios.get<ICurrent>(
            `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`
        );
        setCurrentData(currentResponse.data);

        const forecastResponse = await axios.get<{ list: IFive[] }>(
            `https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${apiKey}&units=metric`
        );

        const fiveDayMap = new Map<string, IFive>();

        forecastResponse.data.list.forEach((forecast: IFive) => {
            const forecastDate = dateFix(forecast.dt_txt);
            if (!fiveDayMap.has(forecastDate)) {
                fiveDayMap.set(forecastDate, { ...forecast, formattedDate: forecastDate });
            }
        });

        const fiveDay = Array.from(fiveDayMap.values());
        setfiveDay(fiveDay);
    } catch (error) {
        console.error("Error fetching data:", error);
        setCurrentData(null);
        setfiveDay(null);
    }
};

  return (
    <>
      <Head>
        <title>nimbus</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <header className={styles.header}>
        <p className={styles.logo}>nimbus</p>
        <div>
          <div className={styles.searching}>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="search for location..."
              className={styles.searchBar}
            /> 
            <button onClick={fetchData} className={styles.submit}>search</button>
          </div>
        </div>
      </header>
      <main className={styles.main}>

        {currentData ? (
          <div className={styles.currentContainer}>
            <div className={styles.currentLocContainer}>
              <div className={styles.currentIcon}>
                <p className={styles.currentLocation}>
                  {currentData.name.toLocaleLowerCase()}, {' '}
                  {currentData.sys.country.toLocaleLowerCase()}
                </p>
                  <Image
                    src={`/icon/${currentData.weather[0].main.toLocaleLowerCase()}.svg`}
                    alt={currentData.weather[0].main}
                    width={25} 
                    height={25}
                  />
              </div>
              <p className={styles.kmh}>last updated — {new Date(currentData.dt * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toLocaleLowerCase()}</p>
            </div>

            <div className={styles.currentWind}>
              <p className={styles.currentDegree}>{Math.ceil(currentData.main.temp)}°C</p>
              <div className={styles.dateWeather}>
                <p className={styles.kmh}>{currentData.wind.speed.toFixed(1)} km/h — {currentData.weather[0].main.toLocaleLowerCase()}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.intro}>
            <p>heading out? let's do a quick rain check.</p>
          </div>
        )}

        {fiveDay && (
          <div className={styles.fiveContainer}>
            <div className={styles.forecast}>
            <p>5—day forecast</p>
            {fiveDay.map((five, index) => (
              <div key={index} className={styles.dailyContainer} style={{ borderBottom: index !== fiveDay.length - 1 ? '1px solid var(--grey)' : 'none' }}>
                  <div className={styles.dayContainer}>
                    <div className={styles.dateIcon}>
                      <p>{dateFix(five.dt_txt).toLocaleLowerCase()}</p>
                        <Image
                          src={`/icon/${five.weather[0].main.toLocaleLowerCase()}.svg`}
                          alt="icon"
                          width={25} 
                          height={25}
                        />
                    </div>
                      <p className={styles.kmh}>{five.wind.speed.toFixed(1)} km/h — {five.weather[0].main.toLocaleLowerCase()}</p>
                  </div>
                  <p className={styles.dailyCelsius}>{(five.main.temp).toFixed(1)}°C</p>
            </div>
            ))}
            </div>
          </div>
        )}

      </main>
      <footer>
        <div className={styles.footer}>
          <p>© 2024 nimbus</p>
          <p>rose nguyen</p>
        </div>
      </footer>
    </>
  );
}
