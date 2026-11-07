import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import {
  ArrowUpRight,
  Check,
  ChevronRight,
  LocateFixed,
  MapPin,
  Search,
  Trash2,
  X,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { Place } from '../types';
import { CURRENT_LOCATION_PLACE, EXPLORE_PLACES } from '../data/defaults';
import { LocationSearchError, searchPlaces } from '../api/geocode';
import { COLORS, FONTS, MAX_WIDTH } from '../ui/theme';
import { SheetHeader } from '../ui/SheetHeader';

type SearchSheetProps = {
  visible: boolean;
  places: Place[];
  activePlaceId: string;
  onClose: () => void;
  onSelect: (place: Place) => void;
  onRemove: (place: Place) => void;
};

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Location timed out')), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

export function SearchSheet({
  visible,
  places,
  activePlaceId,
  onClose,
  onSelect,
  onRemove,
}: SearchSheetProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Place[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    if (!visible) {
      setQuery('');
      setResults([]);
      setSearchError(null);
      setLocationError(null);
      setPermissionDenied(false);
    }
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setIsSearching(false);
      setResults([]);
      setSearchError(null);
      return;
    }

    const controller = new AbortController();
    setIsSearching(true);
    setResults([]);
    setSearchError(null);
    const timer = setTimeout(async () => {
      try {
        const nextResults = await searchPlaces(trimmed, controller.signal);
        if (controller.signal.aborted) return;
        setResults(nextResults);
      } catch (error) {
        if (controller.signal.aborted) return;
        if (error instanceof Error && error.name === 'AbortError') return;
        setResults([]);
        setSearchError(
          error instanceof LocationSearchError
            ? error.message
            : 'Could not search for that place. Try a city and state, or a ZIP code.',
        );
      } finally {
        if (!controller.signal.aborted) setIsSearching(false);
      }
    }, 480);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, visible]);

  const selectPlace = (place: Place) => {
    onSelect(place);
  };

  const locate = async () => {
    setLocating(true);
    setLocationError(null);
    setPermissionDenied(false);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        setPermissionDenied(true);
        setLocationError('Location access is off. Enable it in Settings to use your current spot.');
        return;
      }
      const position = await withTimeout(
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
        15000,
      );
      selectPlace({
        ...CURRENT_LOCATION_PLACE,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    } catch {
      setLocationError('Could not get a location fix. Move near a window or try again.');
    } finally {
      setLocating(false);
    }
  };

  const showResults = query.trim().length >= 2;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <LinearGradient
          colors={['#07131D', '#0A1A27', '#0A1823']}
          locations={[0, 0.55, 1]}
          style={StyleSheet.absoluteFill}
        />
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
          <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <View style={styles.content}>
              <SheetHeader kicker="SKYLINE" title="Places" onClose={onClose} />

              <View style={styles.searchBox}>
                <Search size={17} color={COLORS.textMuted} strokeWidth={2} />
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder="City, state, or ZIP"
                  placeholderTextColor={COLORS.textFaint}
                  style={styles.input}
                  selectionColor={COLORS.amber}
                  autoCapitalize="words"
                  autoCorrect={false}
                  returnKeyType="search"
                  accessibilityLabel="Search for a city, state, or ZIP code"
                />
                {query.length > 0 ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Clear search"
                    onPress={() => setQuery('')}
                    hitSlop={8}
                    style={styles.clear}
                  >
                    <X size={14} color={COLORS.textMuted} strokeWidth={2.2} />
                  </Pressable>
                ) : null}
              </View>

              <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                {!showResults ? (
                  <>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Use my current location"
                      onPress={locate}
                      disabled={locating}
                      style={({ pressed }) => [styles.locateRow, pressed && styles.pressed]}
                    >
                      <View style={styles.locateIcon}>
                        {locating ? (
                          <ActivityIndicator size="small" color={COLORS.amber} />
                        ) : (
                          <LocateFixed size={18} color={COLORS.amber} strokeWidth={2} />
                        )}
                      </View>
                      <View style={styles.rowCopy}>
                        <Text style={styles.locateTitle}>
                          {locating ? 'Finding you…' : 'Use my current location'}
                        </Text>
                        <Text style={styles.rowMeta}>Precise local conditions</Text>
                      </View>
                      <ChevronRight size={16} color={COLORS.textMuted} strokeWidth={2} />
                    </Pressable>

                    {locationError ? (
                      <View style={styles.locationError}>
                        <Text style={styles.errorText}>{locationError}</Text>
                        {permissionDenied ? (
                          <Pressable onPress={() => Linking.openSettings()} hitSlop={6}>
                            <Text style={styles.linkText}>Open Settings</Text>
                          </Pressable>
                        ) : null}
                      </View>
                    ) : null}

                    {places.length ? (
                      <View style={styles.section}>
                        <Text style={styles.sectionTitle}>SAVED</Text>
                        <View style={styles.list}>
                          {places.map((place, index) => {
                            const active = place.id === activePlaceId;
                            return (
                              <View
                                key={place.id}
                                style={[styles.listRow, index < places.length - 1 && styles.divider]}
                              >
                                <Pressable
                                  style={styles.rowButton}
                                  onPress={() => selectPlace(place)}
                                  accessibilityRole="button"
                                  accessibilityLabel={`Show weather for ${place.name}, ${place.region}`}
                                >
                                  <View style={[styles.placeIcon, active && styles.placeIconActive]}>
                                    {active ? (
                                      <Check size={14} color={COLORS.amber} strokeWidth={2.6} />
                                    ) : (
                                      <MapPin size={14} color={COLORS.textMuted} strokeWidth={2} />
                                    )}
                                  </View>
                                  <View style={styles.rowCopy}>
                                    <Text style={styles.placeName}>{place.name}</Text>
                                    <Text style={styles.rowMeta}>
                                      {place.region || 'Current location'}
                                      {active ? ' · Showing now' : ''}
                                    </Text>
                                  </View>
                                </Pressable>
                                <Pressable
                                  accessibilityRole="button"
                                  accessibilityLabel={`Remove ${place.name}`}
                                  onPress={() => onRemove(place)}
                                  hitSlop={8}
                                  style={styles.remove}
                                >
                                  <Trash2 size={14} color={COLORS.textFaint} strokeWidth={1.8} />
                                </Pressable>
                              </View>
                            );
                          })}
                        </View>
                      </View>
                    ) : null}

                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>EXPLORE</Text>
                      <View style={styles.chips}>
                        {EXPLORE_PLACES.map((place) => (
                          <Pressable
                            key={place.id}
                            onPress={() => selectPlace(place)}
                            accessibilityRole="button"
                            accessibilityLabel={`Show weather for ${place.name}, ${place.region}`}
                            style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}
                          >
                            <Text style={styles.chipName}>{place.name}</Text>
                            <Text style={styles.chipRegion}>{place.region}</Text>
                          </Pressable>
                        ))}
                      </View>
                    </View>

                    <Text style={styles.hint}>
                      Skyline uses the National Weather Service, which covers the United States and its territories.
                    </Text>
                  </>
                ) : (
                  <View style={styles.section}>
                    <View style={styles.resultsHeader}>
                      <Text style={styles.sectionTitle}>SEARCH RESULTS</Text>
                      {isSearching ? <ActivityIndicator size="small" color={COLORS.textMuted} /> : null}
                    </View>

                    {searchError ? <Text style={styles.errorText}>{searchError}</Text> : null}

                    {!isSearching && !searchError && results.length === 0 ? (
                      <View style={styles.empty}>
                        <Text style={styles.emptyTitle}>No places found</Text>
                        <Text style={styles.emptyText}>
                          Try a city and state, such as “Asheville, NC”, or a 5-digit ZIP code.
                        </Text>
                      </View>
                    ) : null}

                    <View style={styles.list}>
                      {results.map((place, index) => (
                        <Pressable
                          key={place.id}
                          onPress={() => selectPlace(place)}
                          accessibilityRole="button"
                          accessibilityLabel={`Show weather for ${place.name}, ${place.region}`}
                          style={({ pressed }) => [
                            styles.resultRow,
                            index < results.length - 1 && styles.divider,
                            pressed && styles.pressed,
                          ]}
                        >
                          <View style={styles.placeIcon}>
                            <MapPin size={15} color={COLORS.textSecondary} strokeWidth={2} />
                          </View>
                          <View style={styles.rowCopy}>
                            <Text style={styles.placeName}>{place.name}</Text>
                            <Text style={styles.rowMeta}>{place.region || 'United States'}</Text>
                          </View>
                          <ArrowUpRight size={16} color={COLORS.textMuted} strokeWidth={2} />
                        </Pressable>
                      ))}
                    </View>
                    <Text style={styles.hint}>Search results by OpenStreetMap contributors.</Text>
                  </View>
                )}
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.sheet,
  },
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: MAX_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: 20,
  },
  searchBox: {
    height: 52,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.075)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.lineStrong,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 15,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontFamily: FONTS.bodyMedium,
    fontSize: 14,
    height: '100%',
    paddingVertical: 0,
  },
  clear: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 36,
  },
  locateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 13,
    borderRadius: 18,
    backgroundColor: 'rgba(246, 201, 109, 0.09)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(246, 201, 109, 0.24)',
  },
  locateIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(246, 201, 109, 0.11)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locateTitle: {
    color: COLORS.text,
    fontFamily: FONTS.bodySemibold,
    fontSize: 13,
  },
  rowCopy: {
    flex: 1,
  },
  rowMeta: {
    color: COLORS.textMuted,
    fontFamily: FONTS.body,
    fontSize: 10.5,
    marginTop: 2,
  },
  section: {
    marginTop: 28,
  },
  sectionTitle: {
    color: COLORS.textFaint,
    fontFamily: FONTS.bodySemibold,
    fontSize: 9,
    letterSpacing: 1.7,
    marginBottom: 10,
    marginLeft: 2,
  },
  list: {
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.045)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.line,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 60,
    paddingRight: 8,
  },
  rowButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingLeft: 13,
    paddingVertical: 10,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingLeft: 13,
    paddingRight: 14,
    paddingVertical: 13,
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.line,
  },
  placeIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  placeIconActive: {
    backgroundColor: 'rgba(246, 201, 109, 0.12)',
  },
  placeName: {
    color: COLORS.text,
    fontFamily: FONTS.bodyMedium,
    fontSize: 13,
  },
  remove: {
    width: 36,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    minWidth: '30%',
    flexGrow: 1,
    paddingHorizontal: 13,
    paddingVertical: 12,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.055)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.line,
  },
  chipPressed: {
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  chipName: {
    color: COLORS.text,
    fontFamily: FONTS.bodyMedium,
    fontSize: 12,
  },
  chipRegion: {
    color: COLORS.textMuted,
    fontFamily: FONTS.bodySemibold,
    fontSize: 8.5,
    letterSpacing: 1,
    marginTop: 3,
  },
  hint: {
    color: COLORS.textFaint,
    fontFamily: FONTS.body,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 20,
    paddingHorizontal: 2,
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
    paddingRight: 2,
  },
  empty: {
    paddingVertical: 28,
    alignItems: 'center',
    paddingHorizontal: 22,
  },
  emptyTitle: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.bodySemibold,
    fontSize: 13,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontFamily: FONTS.body,
    fontSize: 11,
    lineHeight: 17,
    textAlign: 'center',
    marginTop: 6,
  },
  errorText: {
    color: COLORS.danger,
    fontFamily: FONTS.body,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 8,
    marginLeft: 2,
  },
  linkText: {
    color: COLORS.amber,
    fontFamily: FONTS.bodySemibold,
    fontSize: 11,
    marginTop: 6,
    marginLeft: 2,
  },
  locationError: {
    paddingHorizontal: 4,
    paddingTop: 8,
  },
  pressed: {
    opacity: 0.65,
  },
});
