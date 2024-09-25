import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, SafeAreaView, StyleSheet, TextInput, Text, TouchableOpacity, View, Linking } from "react-native";
import { searchSugget } from "@/Apis/Api";
import removeAccents from 'remove-accents';

interface LocationProps {
  location: any;
  keyword: string;
}

const Location: React.FC<LocationProps> = ({ location, keyword }) => {
  // Làm nổi bật từ khóa tìm kiếm trong các kết quả được trả về
  const highlightKeyword = (title: string, keyword: string) => {
    // Loại bỏ dấu và chuyển về chữ thường cho cả title và keyword
    const normalizedTitle = removeAccents(title).toLowerCase();
    const normalizedKeyword = removeAccents(keyword).toLowerCase().trim();

    // Tạo regex để tìm từ khóa, gắn cờ 'gi' để tìm kiếm không phân biệt chữ hoa/chữ thường
    const keywordRegex = new RegExp(normalizedKeyword.split(' ').join('\\s*'), 'gi');

    // Sử dụng matchAll để tìm tất cả vị trí khớp từ khóa
    const matches = [...normalizedTitle.matchAll(keywordRegex)];

    if (matches.length === 0) return <Text>{title}</Text>; // Nếu không tìm thấy từ khóa thì trả lại title gốc

    // Tạo chuỗi với từ khóa được làm nổi bật
    const highlightedParts = [];
    let lastIndex = 0;

    matches.forEach((match) => {
      const matchIndex = match.index!;
      highlightedParts.push(title.slice(lastIndex, matchIndex)); // Phần trước từ khóa
      highlightedParts.push(
        <Text key={matchIndex} style={{ color: 'black', fontWeight: '500', fontSize: 18 }}>
          {title.slice(matchIndex, matchIndex + match[0].length)} {/* Giữ nguyên từ gốc có dấu */}
        </Text>
      );
      lastIndex = matchIndex + match[0].length;
    });

    // Thêm phần còn lại của chuỗi sau khi đã làm nổi bật các từ khóa
    highlightedParts.push(title.slice(lastIndex));

    return <>{highlightedParts}</>;
  };


  // Điều hướng sang GG Maps
  const openGoogleMaps = () => {
    const placeName = encodeURIComponent(location.title); // Mã hóa tên địa điểm
    const url = `https://www.google.com/maps/search/?api=1&query=${placeName}`;
    Linking.openURL(url).catch((err) => console.error("Couldn't load page", err));
};

  return (
    <View style={styles.locationSugget}>
      <Ionicons name="location-outline" size={24} color={'black'} />
      <Text style={styles.locationTitle}>{highlightKeyword(location.title, keyword)}</Text>
      <TouchableOpacity onPress={openGoogleMaps}>
        <Ionicons name="navigate-circle-outline" size={26} color={'black'} style={{ padding: 3 }} />
      </TouchableOpacity>
    </View>
  );
};

export default function Index() {
  const [keyWord, setKeyWord] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [suggets, setSuggets] = useState([]);
  const [debouncedKeyWord, setDebouncedKeyWord] = useState(keyWord);
  const APIKEY = "vMljuDdjsicf2vfeWLHO6G-3LeatGhndZiNdp8yJsOA"

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedKeyWord(keyWord);
    }, 1000);
    return () => {
      clearTimeout(handler)
    }
  }, [keyWord]);

  useEffect(() => {
    const fetchData = async () => {
      if (debouncedKeyWord) {
        try {
          const respone: [] = await searchSugget(APIKEY, debouncedKeyWord, '00.000,00.000');
          setSuggets(respone);
          setIsSearching(false)
        } catch (error) {
          console.log(error)
        }
      } else {
        setSuggets([]);
      }
    }

    fetchData();
  }, [debouncedKeyWord]);

  const handleTyping = (val: string) => {
    setKeyWord(val)
    if (!val) {
      setIsSearching(false)
    } else {
      setIsSearching(true)
    }
  }

  const clearKeyWord = () => {
    setSuggets([])
    setKeyWord('');
    setIsSearching(false);
  }

  return (
    <SafeAreaView>
      <View style={styles.viewInputSearch}>
        {!isSearching &&
          <Ionicons name="search" color={'black'} size={24} />}
        {isSearching &&
          <ActivityIndicator size="small" color="black" />}

        <TextInput
          style={styles.inputSearch}
          placeholder="Enter Keyword"
          value={keyWord}
          onChangeText={handleTyping} />

        {keyWord &&
          <TouchableOpacity onPress={clearKeyWord}>
            <Ionicons name="close" color={'black'} size={24} />
          </TouchableOpacity>
        }
      </View>
      <FlatList
        style={{ height:'auto' }}
        data={suggets}
        renderItem={({ item }) => <Location location={item} keyword={debouncedKeyWord} />}
      />

    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  viewInputSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 'auto',
    height: 60,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'grey',
    margin: 10,
    padding: 10
  },
  inputSearch: {
    color: 'black',
    fontSize: 18,
    fontWeight: '500',
    paddingLeft: 10,
    width: '85%'
  },
  locationSugget: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 'auto',
    marginBottom: 10,
    padding: 3
  },
  locationTitle: {
    width: '85%',
    paddingLeft: 10,
    fontSize: 18,
    color: 'grey',
    fontWeight: '400'
  }
})
