// import { useState, useEffect } from 'react';
import './App.css';
import DataTable from './components/DataTable';
// import data from './data.json';

function App() {

  // console.log(data);
  // const [items, setItems] = useState([]);

  // useEffect(() => { // React에서 데이터 가져오기에 가장 일반적인 방법 중 하나
    
  //   // data.json 파일에서 데이터를 가져와서 state 업데이트
  //   setItems(data);

  //   }, []);

  /*
  
  Prop은 컴포넌트를 사용하는 외부자를 위한 데이터
  State는 컴포넌트를 만드는 내부자를 위한 데이터
  
  import { useState } from ‘react’; // useState 쓸 수 있게 선언
  useState는 훅이라고 함: 함수형 컴포넌트에서 상태 관리나 라이프사이클 메서드 등의 기능을 제공하는 react API


  const mode = 'WELCOME';
  mode 값이 뭐냐에 따라서 글이 달라지게 만들겠다

  const _mode = useState('WELCOME');
  -> 상태를 만들어준 것
  _mode의 0번 째 값은 'WELCOME'
  1번 째 값은 함수
  useState는 배열을 반환
  0: 상태의 값을 읽을 때 쓰고
  1: 상태의 값을 변경할 떄 쓰는 함수
  const mode = _mode[0];
  값을 읽을 수 있음
  const setMode = _mode[1];
  -> 1번 째 인덱스의 값으로 값을 변경할 수 있다는 뜻

  축약형으로 간단하게 쓰면
  const [mode, setMode] = useState('WELCOME');

  //값을 바꾸는 방법
  mode = 'READ'; // X
  setMode('READ'); // O
  App()이라는 컴포넌트가 다시 실행됨
  
  //
  const [id, setID] = useState(null);
  setId();
  

  */

  //items 배열을 사용 -> 각 항목의 이름과 가격을 보여주는 리스트를 생성
  //각 항목의 id 값을 key prop으로 지정 -> React가 각 항목을 고유하게 식별할 수 있도록

  return (
    <div className="App">
      <h1>마포구 전세 매물 정보들</h1>
      <DataTable />
    </div>
  );
}

export default App;
