import { supabase } from "./supabaseClient";

export const getTracks = async () => {
  const { data, error } = await supabase
    .from("tracks")
    .select(`
      id,
      title,
      artist,
      audio_url,
      cover_url,
      duration,
      base_wrestlers (
        name
      )
    `)
    .order("title", { ascending: true });

  if (error) {
    console.error("Error fetching tracks:", error);
    throw error;
  }

  return data.map((track) => {
    const wrestlerName =
      Array.isArray(track.base_wrestlers) &&
        track.base_wrestlers.length > 0
        ? track.base_wrestlers[0]?.name
        : null;

    const hasValidName = typeof wrestlerName === "string" && wrestlerName.trim() !== "";

    return {
      id: track.id,
      title: track.title,
      artist: hasValidName ? wrestlerName : track.artist,
      audio_url: track.audio_url,
      cover_url: track.cover_url,
      duration: track.duration,
    };
  });
};

const getUserIdSafe = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
};

export const UserSettings = {
  async get() {
    const userId = await getUserIdSafe();

    if (!userId) return null;

    const { data, error } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) throw error;

    return data;
  },

  async update(updates) {
    const userId = await getUserIdSafe();
    if (!userId) return;

    const { error } = await supabase
      .from("user_settings")
      .update(updates)
      .eq("user_id", userId);

    if (error) throw error;
  },

  updateMusicVolume(volume) {
    return this.update({ music_volume: volume });
  },

  updateSfxVolume(volume) {
    return this.update({ sfx_volume: volume });
  },

  updateLanguage(language) {
    return this.update({ language });
  },

  updateIntergender(value) {
    return this.update({ intergender: value });
  },
};

export const AuthService = {
  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    localStorage.clear();
    sessionStorage.clear();
  },
};

export const getEnabledTracksForUser = async (userId) => {
  const { data, error } = await supabase
    .from("user_track_settings")
    .select(`
      enabled,
      track_id,
      tracks (
        id,
        title,
        artist,
        audio_url,
        cover_url,
        duration,
        base_wrestlers (name)
      )
    `)
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching tracks:", error);
    throw error;
  }

  return data.map((row) => {
    const track = row.tracks;

    const wrestlerName =
      Array.isArray(track.base_wrestlers) &&
        track.base_wrestlers.length > 0
        ? track.base_wrestlers[0]?.name
        : null;

    const hasValidName =
      typeof wrestlerName === "string" &&
      wrestlerName.trim() !== "";

    return {
      id: track.id,
      title: track.title,
      artist: hasValidName ? wrestlerName : track.artist,
      audio_url: track.audio_url,
      cover_url: track.cover_url,
      duration: track.duration,
      enabled: row.enabled
    };
  });
};

export const updateTrackEnabledForUser = async (trackId, enabled) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error: updateError } = await supabase
    .from("user_track_settings")
    .update({ enabled })
    .eq("user_id", user.id)
    .eq("track_id", trackId);

  if (updateError) {
    console.error("Error updating track enabled:", updateError);
    throw updateError;
  }

  const { count } = await supabase
    .from("user_track_settings")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("track_id", trackId);

  if (count === 0) {
    const { error: insertError } = await supabase
      .from("user_track_settings")
      .insert([{ user_id: user.id, track_id: trackId, enabled }]);
    if (insertError) {
      console.error("Error inserting track setting:", insertError);
      throw insertError;
    }
  }
};

export const getOnlyEnabledTracksForUser = async (userId) => {
  const tracks = await getEnabledTracksForUser(userId);
  return tracks.filter(track => track.enabled === true);
};

export const getBaseWrestlers = async () => {
  const { data, error } = await supabase
    .from("base_wrestlers")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching wrestlers:", error);
    throw error;
  }
  return data;
};

export const checkIsAdmin = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from("user_settings")
    .select("administrator")
    .eq("user_id", user.id)
    .single();

  if (error) {
    console.error("Error comprobando admin:", error);
    return false;
  }

  return data?.administrator === true;
};

export const uploadFileToStorage = async (bucket, file) => {
  const cleanFileName = file.name.replace(/\s+/g, '_');
  const uniqueFileName = `${Date.now()}_${cleanFileName}`;
  const filePath = `public/${uniqueFileName}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) throw error;

  const { data: publicUrlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
};

export const getTrackById = async (trackId) => {
  const { data, error } = await supabase.from('tracks').select('*').eq('id', trackId).single();
  if (error) throw error;
  return data;
};

export const saveTrack = async (trackPayload) => {
  const { data, error } = await supabase.from('tracks').upsert(trackPayload).select().single();
  if (error) throw error;
  return data;
};

export const deleteTrack = async (trackId) => {
  const { error } = await supabase.from('tracks').delete().eq('id', trackId);
  if (error) throw error;
};

export const saveWrestler = async (wrestlerPayload) => {
  const { data, error } = await supabase.from('base_wrestlers').upsert(wrestlerPayload).select().single();
  if (error) throw error;
  return data;
};

export const deleteWrestler = async (wrestlerId, trackId) => {
  if (trackId) {
    await supabase.from('tracks').delete().eq('id', trackId);
  }
  const { error } = await supabase.from('base_wrestlers').delete().eq('id', wrestlerId);
  if (error) throw error;
};