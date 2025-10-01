const Album = require("../models/albumModel");
const Song = require("../models/songModel");
const User = require("../models/userModel");
const path = require("path");
const {validationResult} = require("express-validator");
const fs = require("fs");


exports.createAlbum = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }
        const {title, artist} = req.body;
        const coverImagePath = req.file
            ? `/albums/cover/${req.file.filename}`
            : null;

        const album = new Album({
            title,
            artist,
            coverImagePath,
            owner: req.user.id,
            songs: [],
        });
        await album.save();
        res.status(201).json(album);
    } catch (error) {
        res.status(500).json({error: "Failed to create album"});
    }
};

// Serve album cover images
exports.getAlbumCover = (req, res) => {
    const fileName = req.params.filename;
    const imagePath = path.join(
        __dirname,
        "..",
        "uploads",
        "album-covers",
        fileName
    );
    res.sendFile(imagePath);
};
// POST /albums/add-song
// body: { albumId, songId }
exports.addSongToAlbum = async (req, res) => {
    try {
        const {albumId, songId} = req.body;
        if (!albumId || !songId) {
            return res.status(400).json({error: 'albumId and songId are required'});
        }

        // Optional: ensure both exist
        const [album, song] = await Promise.all([
            Album.findById(albumId),
            Song.findById(songId),
        ]);
        if (!album) return res.status(404).json({error: 'Album not found'});
        if (!song) return res.status(404).json({error: 'Song not found'});


        if (String(album.owner) !== req.user.id) return res.status(403).json({error: 'Forbidden'});

        await Album.updateOne(
            {_id: albumId},
            {$addToSet: {songs: songId}} // prevents duplicates
        );

        return res.status(200).json({message: 'Song added to album'});
    } catch (err) {
        console.error('Error adding song to album:', err);
        return res.status(500).json({error: 'Error adding song to album'});
    }
};

// POST /albums/remove-song
// body: { albumId, songId }
exports.removeSongFromAlbum = async (req, res) => {
    try {
        const {albumId, songId} = req.body;
        if (!albumId || !songId) {
            return res.status(400).json({error: 'albumId and songId are required'});
        }

        const album = await Album.findById(albumId);
        if (!album) return res.status(404).json({error: 'Album not found'});

        // Optional ownership check
        if (String(album.owner) !== req.user.id) return res.status(403).json({error: 'Forbidden'});

        await Album.updateOne(
            {_id: albumId},
            {$pull: {songs: songId}}
        );

        return res.status(200).json({message: 'Song removed from album'});
    } catch (err) {
        console.error('Error removing song from album:', err);
        return res.status(500).json({error: 'Error removing song from album'});
    }
};


exports.getAlbums = async (req, res) => {
    try {
        const albums = await Album.find({owner: req.user.id}).populate("songs");
        const baseUrl = req.protocol + "://" + req.get("host");

        const albumsWithFullPaths = albums.map((album) => {
            // Convert Mongoose document to plain object
            const albumObj = album.toObject();

            // Add full cover image path
            if (albumObj.coverImagePath) {
                albumObj.coverImagePath = baseUrl + albumObj.coverImagePath;
            }

            // Optionally, add full imagePath for each song
            if (albumObj.songs && Array.isArray(albumObj.songs)) {
                albumObj.songs = albumObj.songs.map((song) => {
                    if (song.imagePath && !song.imagePath.startsWith("http")) {
                        return {
                            ...song,
                            imagePath:
                                baseUrl +
                                "/songs/image/" +
                                encodeURIComponent(song.imagePath.split("/").pop()),
                        };
                    }
                    return song;
                });
            }

            return albumObj;
        });

        res.status(200).json(albumsWithFullPaths);
    } catch (error) {
        res.status(500).json({error: "Failed to fetch albums"});
    }
};

exports.getAllAlbums = async (req, res) => {
    try {
        const albums = await Album.find().populate("songs");
        const baseUrl = req.protocol + "://" + req.get("host");

        const albumsWithFullPaths = albums.map((album) => {
            const albumObj = album.toObject();

            if (albumObj.coverImagePath) {
                albumObj.coverImagePath = baseUrl + albumObj.coverImagePath;
            }

            if (albumObj.songs && Array.isArray(albumObj.songs)) {
                albumObj.songs = albumObj.songs.map((song) => {
                    if (song.imagePath && !String(song.imagePath).startsWith("http")) {
                        return {
                            ...song,
                            imagePath:
                                baseUrl +
                                "/songs/image/" +
                                encodeURIComponent(String(song.imagePath).split("/").pop()),
                        };
                    }
                    return song;
                });
            }

            return albumObj;
        });

        return res.status(200).json(albumsWithFullPaths);
    } catch (error) {
        console.error('Error fetching all albums:', error);
        return res.status(500).json({error: "Failed to fetch albums"});
    }
}


exports.editAlbum = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }

        const {title, artist} = req.body;
        const album = await Album.findById(req.params.id);

        if (!album) {
            return res.status(404).json({error: 'Album not found'});
        }

        if (String(album.owner) !== req.user.id) {
            return res.status(403).json({error: 'Forbidden'});
        }

        if (typeof title === 'string' && title.trim() !== '') {
            album.title = title;
        }
        if (typeof artist === 'string' && artist.trim() !== '') {
            album.artist = artist;
        }

        if (req.file) {
            const previousCoverPath = album.coverImagePath || null;
            album.coverImagePath = `/albums/cover/${req.file.filename}`;

            if (previousCoverPath) {
                try {
                    const oldFileName = previousCoverPath.split('/').pop();
                    const oldFilePath = path.join(
                        __dirname,
                        "..",
                        "uploads",
                        "album-covers",
                        oldFileName
                    );
                    fs.unlink(oldFilePath, () => {
                    });
                } catch (e) {
                    // swallow file delete errors to not block the response
                }
            }
        }

        await album.save();
        return res.status(200).json(album);
    } catch (error) {
        console.error('Error editing album:', error);
        return res.status(500).json({error: 'Failed to update album'});
    }
}

